import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";

export const authOptions = {
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize(credentials) {
        await dbConnect();

        const email = credentials?.email;
        const password = credentials?.password;

        if (!email || !password) return null;

        const user = await User.findOne({ email });
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // ตอน login ใหม่ user จะมา -> เก็บให้ครบ
      if (user) {
        token.id = user.id;     // ✅ เพิ่ม: เก็บ id ชัวร์ๆ
        token.role = user.role; // ✅ เดิมคุณมีแล้ว
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      // ✅ ทำให้ session.user มี id/role แบบชัวร์
      session.user.id = token.id || token.sub;
      session.user.role = token.role;

      // เผื่อใช้ใน UI
      session.user.name = token.name || session.user.name;
      session.user.email = token.email || session.user.email;

      return session;
    },
  },

  pages: { signIn: "/login" },
};