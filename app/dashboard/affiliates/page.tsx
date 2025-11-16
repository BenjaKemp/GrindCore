import { ExternalLink } from 'lucide-react';

export default function AffiliatesPage() {
  const affiliates = [
    {
      name: 'Nutmeg',
      description: 'ISA & Investment Platform',
      benefit: 'FCA-regulated investing with low fees',
      link: 'https://refer.nutmeg.com/reward',
      cta: 'Open ISA',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'Coinbase',
      description: 'Crypto Exchange',
      benefit: 'Get £10 free when you trade £100+',
      link: 'https://www.coinbase.com/join/kemp_benj',
      cta: 'Claim £10 Free',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      name: 'Lido',
      description: 'Ethereum Staking',
      benefit: 'Earn 4-6% APY on ETH',
      link: 'https://lido.fi',
      cta: 'Stake ETH',
      color: 'from-purple-500 to-pink-500',
    },
    {
      name: 'Marinade Finance',
      description: 'Solana Staking',
      benefit: 'Earn 7-9% APY on SOL',
      link: 'https://marinade.finance',
      cta: 'Stake SOL',
      color: 'from-green-500 to-teal-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Affiliate Partners</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Recommended platforms to grow your passive income. Support the project by using these links.
        </p>
      </div>

      {/* Affiliates Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {affiliates.map((affiliate) => (
          <div
            key={affiliate.name}
            className="group rounded-lg border border-zinc-200 bg-white p-6 transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className={`mb-4 inline-block rounded-lg bg-gradient-to-r ${affiliate.color} p-3`}>
              <ExternalLink className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-1">{affiliate.name}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
              {affiliate.description}
            </p>
            <div className="rounded-lg bg-zinc-50 p-3 mb-4 dark:bg-zinc-800">
              <p className="text-sm font-medium">💡 {affiliate.benefit}</p>
            </div>
            <a
              href={affiliate.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 rounded-lg bg-gradient-to-r ${affiliate.color} px-4 py-2 text-sm font-medium text-white transition-transform group-hover:scale-105`}
            >
              {affiliate.cta} →
            </a>
          </div>
        ))}
      </div>

      {/* Disclosure */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-sm font-semibold mb-2">Affiliate Disclosure</h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          We may earn a commission if you sign up through these links, at no extra cost to you. 
          We only recommend platforms we personally use and trust. All partners are FCA-regulated 
          or industry-leading platforms.
        </p>
      </div>

      {/* Add Your Own */}
      <div className="rounded-lg border-2 border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="text-lg font-semibold mb-2">Want to Add Your Affiliate?</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          If you have a passive income platform you'd like to recommend, contact us to feature it here.
        </p>
        <button className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
          Contact Support
        </button>
      </div>
    </div>
  );
}

