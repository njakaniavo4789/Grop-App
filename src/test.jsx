'use client'

import React from 'react'
import { DataCard } from '@/components/cards/data-card'
import { AIInsight } from '@/components/cards/ai-insight'
import { BarChart3, Droplets, Leaf, TrendingUp } from 'lucide-react'

export function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Agricultural Command Center</h1>
        <p className="text-muted-foreground">Real-time intelligence for optimal crop management</p>
      </div>

      {/* KPI Overview Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Key Performance Indicators</h2>
          <span className="text-xs text-muted-foreground">Updated 5 minutes ago</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DataCard
            title="Total Crop Yield"
            value={15240}
            suffix=" tons"
            trend={14}
            trendLabel="vs last month"
            icon={<BarChart3 size={20} />}
            description="Across all regions"
            interactive
          />

          <DataCard
            title="Soil Moisture"
            value={68}
            suffix="%"
            trend={-5}
            trendLabel="decreasing"
            icon={<Droplets size={20} />}
            description="Avg moisture level"
            interactive
          />

          <DataCard
            title="Crop Health Index"
            value={92}
            suffix="/100"
            trend={8}
            trendLabel="improving"
            icon={<Leaf size={20} />}
            description="Plant vitality score"
            interactive
          />

          <DataCard
            title="Regional Productivity"
            value={34}
            suffix="% ↑"
            trend={19}
            trendLabel="growth rate"
            icon={<TrendingUp size={20} />}
            description="Efficiency gain"
            interactive
          />
        </div>
      </section>

      {/* AI Insights Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">AI-Powered Recommendations</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIInsight
            title="Optimize Rice Cultivation in Analamanga"
            description="AI analysis shows optimal conditions for rice expansion. Current moisture levels and seasonal forecast indicate +14% yield potential with proper crop rotation implementation."
            confidenceScore={94}
            actionLabel="View Detailed Analysis"
            onAction={() => console.log('clicked')}
          />

          <AIInsight
            title="Drought Risk Alert in Vakinankaratra"
            description="Early warning system detected declining water stress index. Recommend implementing drip irrigation systems and schedule strategic watering for maximum crop protection."
            confidenceScore={87}
            actionLabel="Get Mitigation Plan"
            onAction={() => console.log('clicked')}
          />
        </div>
      </section>

      {/* Regional Performance */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Regional Performance Overview</h2>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { region: 'Analamanga', production: '42%', status: 'Excellent' },
              { region: 'Vakinankaratra', production: '38%', status: 'Good' },
              { region: 'Itasy', production: '20%', status: 'Developing' },
            ].map((data, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-border hover:border-primary/30 transition-colors cursor-pointer">
                <p className="text-sm font-semibold text-foreground">{data.region}</p>
                <p className="text-2xl font-bold text-emerald-600 mt-2">{data.production}</p>
                <p className="text-xs text-muted-foreground mt-1">Status: {data.status}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Crop Health Summary */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Crop Health Summary</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { crop: 'Rice', health: 94, area: '12,500 ha' },
            { crop: 'Maize', health: 87, area: '8,200 ha' },
            { crop: 'Beans', health: 79, area: '5,600 ha' },
            { crop: 'Vegetables', health: 91, area: '3,400 ha' },
          ].map((crop, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-card border border-border hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-foreground">{crop.crop}</span>
                <span className="text-sm font-bold text-emerald-600">{crop.health}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-emerald-light to-cyan-electric"
                  style={{ width: `${crop.health}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{crop.area}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
