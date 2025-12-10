import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import pool from "@/config/db";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await pool.query("SELECT * FROM publications.users WHERE email = $1", [credentials.email]);

        const user = res.rows[0];
        if (user && (await bcrypt.compare(credentials.password, user.password))) {
          return {
            id: user.id,
            email: user.email,
            role: user.role || 'user',
            firstName: user.first_name,
            lastName: user.last_name,
            profile: user.profile
          };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/publications/connexion',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.profile = user.profile;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
        session.user.role = token.role || 'user';
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.profile = token.profile;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
