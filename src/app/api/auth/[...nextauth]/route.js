import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export const authOptions = {
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          const email = String(credentials?.email || "").toLowerCase().trim();
          const password = String(credentials?.password || "");

          if (!email || !password) return null;

          await dbConnect();

          // ดึง password มาด้วย (กันกรณีในอนาคตมี select:false)
          const user = await User.findOne({ email }).select("+password").lean();
          if (!user) return null;

          const ok = await bcrypt.compare(password, user.password);
          if (!ok) return null;

          return {
            id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (e) {
          // ให้ NextAuth ตีเป็น 401 แทน 500
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // ตอน login สำเร็จ user จะมาอยู่ตรงนี้
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      // ส่ง id/role ไปใช้ฝั่ง client + API routes
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };