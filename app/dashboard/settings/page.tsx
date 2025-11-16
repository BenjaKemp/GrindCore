import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { connections, cryptoWallets } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { User, Bell, Shield, CreditCard } from 'lucide-react';

export default async function SettingsPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect('/sign-in');
  }

  // Get connected accounts
  const bankConnections = await db
    .select()
    .from(connections)
    .where(eq(connections.userId, userId));

  const wallets = await db
    .select()
    .from(cryptoWallets)
    .where(eq(cryptoWallets.userId, userId));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Manage your account, connections, and preferences.
        </p>
      </div>

      {/* Account */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3 mb-4">
          <User className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Account</h2>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
            <button className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Connected Accounts</h2>
        </div>
        
        <div className="space-y-4">
          {/* Bank Accounts */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Bank Accounts (TrueLayer)</h3>
            {bankConnections.length > 0 ? (
              <div className="space-y-2">
                {bankConnections.map((conn) => (
                  <div key={conn.id} className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                    <div>
                      <p className="text-sm font-medium">Bank Account</p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Connected {new Date(conn.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button className="text-sm text-red-600 hover:underline">
                      Disconnect
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No bank accounts connected.{' '}
                <a href="/api/truelayer/connect" className="text-purple-600 hover:underline">
                  Connect now
                </a>
              </p>
            )}
          </div>

          {/* Crypto Wallets */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Crypto Wallets</h3>
            {wallets.length > 0 ? (
              <div className="space-y-2">
                {wallets.map((wallet) => (
                  <div key={wallet.id} className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                    <div>
                      <p className="text-sm font-medium">{wallet.chain}</p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                        {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                      </p>
                    </div>
                    <button className="text-sm text-red-600 hover:underline">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No crypto wallets connected.{' '}
                <a href="/dashboard/crypto" className="text-purple-600 hover:underline">
                  Connect now
                </a>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Notifications</h2>
        </div>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium">Transaction Alerts</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Get notified when new passive income is detected
              </p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-zinc-300"
              defaultChecked
            />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekly Summary</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Receive a weekly email with your passive income summary
              </p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-zinc-300"
              defaultChecked
            />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium">Tax Reminders</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Reminders about ISA limits and tax deadlines
              </p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-zinc-300"
            />
          </label>
        </div>
      </div>

      {/* Subscription */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Subscription</h2>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-4 dark:from-purple-950 dark:to-pink-950">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-semibold">Free Plan</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Bank account tracking included
              </p>
            </div>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-900/20 dark:text-green-400">
              Active
            </span>
          </div>
          <button className="mt-3 w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-pink-700">
            Upgrade to Pro →
          </button>
          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
            Unlock crypto tracking, advanced tax tools, and priority support for £5/mo
          </p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/20">
        <h2 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">Danger Zone</h2>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
          These actions are permanent and cannot be undone.
        </p>
        <button className="rounded-lg border-2 border-red-600 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-600 hover:text-white transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}

