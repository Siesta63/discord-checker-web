"use client";

import { useRouter } from "next/navigation";
import { FiLoader } from "react-icons/fi";

import HelpTooltip from "~/components/common/help-tooltip";
import TitledCard from "~/components/common/titled-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { api } from "~/trpc/react";

export default function ProfileAccountActionsCard() {
  const router = useRouter();
  const utils = api.useUtils();

  const [user] = api.user.me.useSuspenseQuery();

  const { mutateAsync: deleteAccount, isLoading: isDeletingAccount } =
    api.user.delete.useMutation({
      onSuccess: () => {
        router.push("/");
      },
    });

  const {
    mutateAsync: clearDiscordAccounts,
    isLoading: isClearingDiscordAccounts,
  } = api.account.deleteAll.useMutation({
    onSuccess: () => {
      router.push("/accounts");
    },
  });

  const { mutateAsync: updateProfile } = api.user.update.useMutation({
    onMutate: async (input) => {
      await utils.user.me.cancel();

      const prevData = utils.user.me.getData();
      utils.user.me.setData(undefined, (old) => {
        return Object.assign(old!, input);
      });
      return {
        prevData,
      };
    },
    onError: (err, newProfile, ctx) => {
      utils.user.me.setData(undefined, ctx?.prevData);
    },
    onSettled: async () => {
      await utils.user.me.invalidate();
    },
  });

  return (
    <TitledCard
      title="Account Management"
      extra={
        <HelpTooltip>
          These actions are immediate and can not be reverted
        </HelpTooltip>
      }
    >
      <div className="space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between rounded-lg gap-4 border p-3 shadow-sm">
          <div className="max-w-md space-y-0.5">
            <h3 className="text-base font-medium">Hide my Name</h3>
            <p className="text-xs font-light">
              When enabled, your name will be hidden on public pages like the
              leaderboard. It will be shown as "Anonymous User" and not
              traceable to your account.
            </p>
          </div>

          <Switch
            checked={user.publicAnonymous}
            onCheckedChange={(publicAnonymous) =>
              updateProfile({ publicAnonymous })
            }
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between rounded-lg border p-3 shadow-sm">
          <div className="max-w-md space-y-1.5">
            <h3 className="text-base font-medium">Clear stored Accounts</h3>
            <p className="text-xs font-light">
              By clicking this button, you will delete all your stored Discord
              accounts from our database. You can import new accounts at any
              time and your personal data will not be affected.
            </p>
          </div>

          <div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="secondary"
                  className="w-full"
                  disabled={isClearingDiscordAccounts}
                >
                  {isClearingDiscordAccounts && (
                    <FiLoader className="animate-spin mr-2" />
                  )}
                  <span>Clear Accounts</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>
                  Are you sure you want to clear all your accounts?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action will immediately delete all your stored Discord
                  accounts from our database. <br /> <br />
                  You can import new accounts at any time and your personal data
                  will not be affected.
                </AlertDialogDescription>
                <AlertDialogFooter className="border-t pt-4">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => clearDiscordAccounts()}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between rounded-lg border p-3 shadow-sm">
          <div className="max-w-md space-y-1.5">
            <h3 className="text-base font-medium">Account Deletion</h3>
            <p className="text-xs font-light">
              This action will immediately delete your account and all
              associated data. Every stored account of you will be deleted from
              our database. If you have an active subscription, you will lose
              access to it.
            </p>
          </div>

          <div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="default"
                  className="bg-red-600 hover:bg-red-700 w-full"
                  disabled={isDeletingAccount}
                >
                  {isDeletingAccount && (
                    <FiLoader className="animate-spin mr-2" />
                  )}
                  <span>Delete my Account</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>
                  Are you sure you want to delete your account?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action will immediately delete your account and all
                  associated data. Every stored account of you will be deleted
                  from our database. <br />
                  <br />
                  If you have an active subscription, you will lose access to
                  it.
                </AlertDialogDescription>
                <AlertDialogFooter className="border-t pt-4">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => deleteAccount()}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </TitledCard>
  );
}
