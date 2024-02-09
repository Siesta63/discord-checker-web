import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type Role } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

import { env } from "~/env";
import { db } from "~/server/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: Role;
      subscribedTill?: Date;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    subscribedTill?: Date;
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/dashboard",
    error: "/",
  },
  callbacks: {
    signIn({ account, profile }) {
      return !!account && account.provider === "discord" && !!profile?.email;
    },
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        role: user.role,
        subscribedTill: user.subscribedTill,
      },
    }),
  },
  // TODO: Setup Discord webhook events for personal use (profile settings)
  events: {
    signIn({ user }) {
      Sentry.setUser({
        id: user.id,
        email: user.email ?? undefined,
        username: user.name ?? undefined,
      });
    },
    signOut() {
      Sentry.setUser(null);
    },
  },
  adapter: PrismaAdapter(db),
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
  ],
};

export const getServerAuthSession = () => getServerSession(authOptions);
