import React, { useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from 'recharts';
import { Upload, Download, RefreshCw, FileText, Image, AlertCircle, CheckCircle, X, ChevronDown } from 'lucide-react';

export default function AITrafficDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [darkVisitorData, setDarkVisitorData] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({ show: false, type: '', message: '' });
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const dashboardRef = useRef(null);
  const fileInputRef = useRef(null);
  const dvFileInputRef = useRef(null);

  // Default data (your actual data)
  const defaultData = [
    { channel: 'Direct', traffic_quality: 'Likely Bot/AI', sessions: 2141, avg_pages: 1, avg_engagement_sec: 0.5, conversions: 0, pct_of_channel: 68.8 },
    { channel: 'Direct', traffic_quality: 'Likely Human', sessions: 516, avg_pages: 2.14, avg_engagement_sec: 46.3, conversions: 0, pct_of_channel: 16.6 },
    { channel: 'Direct', traffic_quality: 'Uncertain', sessions: 455, avg_pages: 1, avg_engagement_sec: 9.5, conversions: 0, pct_of_channel: 14.6 },
    { channel: 'Organic', traffic_quality: 'Likely Bot/AI', sessions: 255, avg_pages: 1, avg_engagement_sec: 0.6, conversions: 0, pct_of_channel: 53.5 },
    { channel: 'Organic', traffic_quality: 'Likely Human', sessions: 166, avg_pages: 1.84, avg_engagement_sec: 68, conversions: 0, pct_of_channel: 34.8 },
    { channel: 'Organic', traffic_quality: 'Uncertain', sessions: 56, avg_pages: 1, avg_engagement_sec: 9.4, conversions: 0, pct_of_channel: 11.7 },
    { channel: 'Referral', traffic_quality: 'Likely Bot/AI', sessions: 82, avg_pages: 1, avg_engagement_sec: 0.6, conversions: 0, pct_of_channel: 57.3 },
    { channel: 'Referral', traffic_quality: 'Likely Human', sessions: 44, avg_pages: 1.64, avg_engagement_sec: 57.9, conversions: 0, pct_of_channel: 30.8 },
    { channel: 'Referral', traffic_quality: 'Uncertain', sessions: 17, avg_pages: 1, avg_engagement_sec: 10.1, conversions: 0, pct_of_channel: 11.9 },
    { channel: 'Other', traffic_quality: 'Likely Bot/AI', sessions: 15, avg_pages: 1, avg_engagement_sec: 0.1, conversions: 0, pct_of_channel: 55.6 },
    { channel: 'Other', traffic_quality: 'Likely Human', sessions: 10, avg_pages: 2, avg_engagement_sec: 30, conversions: 0, pct_of_channel: 37 },
    { channel: 'Other', traffic_quality: 'Uncertain', sessions: 2, avg_pages: 1, avg_engagement_sec: 6.6, conversions: 0, pct_of_channel: 7.4 },
  ];

  const defaultDarkVisitorData = [
    { name: 'meta-externalagent', visits: 4700, type: 'AI' },
    { name: 'Googlebot', visits: 4600, type: 'Search' },
    { name: 'DotBot', visits: 3800, type: 'SEO' },
    { name: 'Uptimebot', visits: 2000, type: 'Monitoring' },
    { name: 'ChatGPT-User', visits: 1500, type: 'AI Assistant' },
    { name: 'AhrefsBot', visits: 1400, type: 'SEO' },
    { name: 'YandexBot', visits: 1200, type: 'Search' },
    { name: 'Baiduspider', visits: 1200, type: 'Search' },
    { name: 'SemrushBot', visits: 1000, type: 'SEO' },
    { name: 'PetalBot', visits: 646, type: 'Search' },
  ];

  const channelQualityData = data || defaultData;
  const agentData = darkVisitorData || defaultDarkVisitorData;

  // Parse CSV data
  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''));
      const row = {};
      headers.forEach((header, i) => {
        const val = values[i];
        // Try to parse as number
        const num = parseFloat(val);
        row[header] = isNaN(num) ? val : num;
      });
      return row;
    });
  };

  // Handle BigQuery data upload
  const handleDataUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = parseCSV(event.target.result);
        
        // Map to expected format
        const mapped = parsed.map(row => ({
          channel: row.channel || row.channel_grouping || 'Unknown',
          traffic_quality: row.traffic_quality || row.quality || 'Unknown',
          sessions: row.sessions || row.session_count || 0,
          avg_pages: row.avg_pages || row.unique_pages || 1,
          avg_engagement_sec: row.avg_engagement_sec || row.engagement_seconds || row.avg_engagement || 0,
          conversions: row.conversions || row.total_conversions || 0,
          pct_of_channel: row.pct_of_channel || 0,
        }));

        // Calculate percentages if not provided
        const channels = [...new Set(mapped.map(r => r.channel))];
        channels.forEach(ch => {
          const chData = mapped.filter(r => r.channel === ch);
          const total = chData.reduce((s, r) => s + r.sessions, 0);
          chData.forEach(r => {
            if (!r.pct_of_channel) {
              r.pct_of_channel = Math.round((r.sessions / total) * 1000) / 10;
            }
          });
        });

        setData(mapped);
        setUploadStatus({ show: true, type: 'success', message: `Loaded ${mapped.length} rows from ${file.name}` });
        setTimeout(() => setUploadStatus({ show: false, type: '', message: '' }), 3000);
      } catch (err) {
        setUploadStatus({ show: true, type: 'error', message: `Error parsing file: ${err.message}` });
        setTimeout(() => setUploadStatus({ show: false, type: '', message: '' }), 5000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handle Dark Visitors data upload
  const handleDVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = parseCSV(event.target.result);
        const mapped = parsed.map(row => ({
          name: row.name || row.agent || row.agent_name || 'Unknown',
          visits: row.visits || row.visit_count || row.count || 0,
          type: row.type || row.agent_type || 'Unknown',
        })).sort((a, b) => b.visits - a.visits).slice(0, 15);

        setDarkVisitorData(mapped);
        setUploadStatus({ show: true, type: 'success', message: `Loaded ${mapped.length} agents from ${file.name}` });
        setTimeout(() => setUploadStatus({ show: false, type: '', message: '' }), 3000);
      } catch (err) {
        setUploadStatus({ show: true, type: 'error', message: `Error parsing file: ${err.message}` });
        setTimeout(() => setUploadStatus({ show: false, type: '', message: '' }), 5000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Export functions
  const exportToCSV = () => {
    const headers = ['channel', 'traffic_quality', 'sessions', 'avg_pages', 'avg_engagement_sec', 'conversions', 'pct_of_channel'];
    const csv = [
      headers.join(','),
      ...channelQualityData.map(row => headers.map(h => row[h]).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traffic_quality_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const exportData = {
      generated: new Date().toISOString(),
      trafficQuality: channelQualityData,
      agents: agentData,
      summary: {
        totalSessions: channelQualityData.reduce((s, r) => s + r.sessions, 0),
        directBotPct: directPieData.find(d => d.name === 'Likely Bot/AI')?.pct || 0,
        directHumanPct: directPieData.find(d => d.name === 'Likely Human')?.pct || 0,
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai_traffic_analysis_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate daily trend data (simulated based on totals)
  const generateDailyTrend = () => {
    const directData = channelQualityData.filter(d => d.channel === 'Direct');
    const botTotal = directData.find(d => d.traffic_quality === 'Likely Bot/AI')?.sessions || 100;
    const humanTotal = directData.find(d => d.traffic_quality === 'Likely Human')?.sessions || 20;
    const uncTotal = directData.find(d => d.traffic_quality === 'Uncertain')?.sessions || 15;

    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const variance = 0.3;
      const spikeDay = i > 10 && i < 20;
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        bot: Math.round((botTotal / 30) * (1 + (Math.random() - 0.5) * variance) * (spikeDay ? 1.5 : 1)),
        human: Math.round((humanTotal / 30) * (1 + (Math.random() - 0.5) * variance)),
        uncertain: Math.round((uncTotal / 30) * (1 + (Math.random() - 0.5) * variance)),
      };
    });
  };

  const dailyTrendData = generateDailyTrend();

  // Computed data for charts
  const directPieData = channelQualityData
    .filter(d => d.channel === 'Direct')
    .map(d => ({ name: d.traffic_quality, value: d.sessions, pct: d.pct_of_channel }));

  const channelStackedData = [...new Set(channelQualityData.map(d => d.channel))].map(channel => {
    const cd = channelQualityData.filter(d => d.channel === channel);
    return {
      channel,
      'Likely Bot/AI': cd.find(d => d.traffic_quality === 'Likely Bot/AI')?.sessions || 0,
      'Likely Human': cd.find(d => d.traffic_quality === 'Likely Human')?.sessions || 0,
      'Uncertain': cd.find(d => d.traffic_quality === 'Uncertain')?.sessions || 0,
    };
  });

  const engagementData = [...new Set(channelQualityData.map(d => d.channel))].slice(0, 4).map(channel => {
    const cd = channelQualityData.filter(d => d.channel === channel);
    return {
      channel,
      'Bot/AI': cd.find(d => d.traffic_quality === 'Likely Bot/AI')?.avg_engagement_sec || 0,
      'Human': cd.find(d => d.traffic_quality === 'Likely Human')?.avg_engagement_sec || 0,
    };
  });

  const botPctData = [...new Set(channelQualityData.map(d => d.channel))].map(channel => {
    const cd = channelQualityData.filter(d => d.channel === channel);
    const total = cd.reduce((s, r) => s + r.sessions, 0);
    const bot = cd.find(d => d.traffic_quality === 'Likely Bot/AI')?.sessions || 0;
    return { channel, pct: total > 0 ? Math.round((bot / total) * 100) : 0 };
  }).sort((a, b) => b.pct - a.pct);

  const COLORS = { bot: '#ef4444', human: '#22c55e', uncertain: '#f59e0b' };
  const pieColors = [COLORS.bot, COLORS.human, COLORS.uncertain];

  const totalDirect = directPieData.reduce((s, d) => s + d.value, 0);
  const botSessions = directPieData.find(d => d.name === 'Likely Bot/AI')?.value || 0;
  const humanSessions = directPieData.find(d => d.name === 'Likely Human')?.value || 0;
  const uncertainSessions = directPieData.find(d => d.name === 'Uncertain')?.value || 0;
  const botPct = directPieData.find(d => d.name === 'Likely Bot/AI')?.pct || 0;
  const humanPct = directPieData.find(d => d.name === 'Likely Human')?.pct || 0;

  const TabBtn = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 font-medium rounded-lg transition-all ${
        activeTab === id
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white" ref={dashboardRef}>
      {/* Status Toast */}
      {uploadStatus.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          uploadStatus.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {uploadStatus.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{uploadStatus.message}</span>
          <button onClick={() => setUploadStatus({ show: false, type: '', message: '' })}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">AI Traffic Attribution Analyzer</h1>
              <p className="text-gray-400 text-sm">Identify bot pollution in your analytics data</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Upload Button */}
              <div className="relative">
                <button
                  onClick={() => setShowUploadPanel(!showUploadPanel)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Upload size={18} />
                  <span>Upload Data</span>
                  <ChevronDown size={16} className={`transition-transform ${showUploadPanel ? 'rotate-180' : ''}`} />
                </button>
                
                {showUploadPanel && (
                  <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">BigQuery Traffic Data (CSV)</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleDataUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                      >
                        <Upload size={18} />
                        Upload Traffic CSV
                      </button>
                      <p className="text-xs text-gray-500 mt-1">Columns: channel, traffic_quality, sessions, avg_engagement_sec</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Dark Visitors Data (CSV)</label>
                      <input
                        ref={dvFileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleDVUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => dvFileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
                      >
                        <Upload size={18} />
                        Upload Agent CSV
                      </button>
                      <p className="text-xs text-gray-500 mt-1">Columns: name, visits, type</p>
                    </div>

                    <div className="pt-2 border-t border-gray-700">
                      <button
                        onClick={() => { setData(null); setDarkVisitorData(null); setShowUploadPanel(false); }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                      >
                        <RefreshCw size={16} />
                        Reset to Default Data
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Export Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors">
                  <Download size={18} />
                  <span>Export</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <button
                    onClick={exportToCSV}
                    className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-700 rounded-t-lg transition-colors"
                  >
                    <FileText size={16} />
                    Export as CSV
                  </button>
                  <button
                    onClick={exportToJSON}
                    className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-700 rounded-b-lg transition-colors"
                  >
                    <FileText size={16} />
                    Export as JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Data Status */}
        {(data || darkVisitorData) && (
          <div className="flex items-center gap-2 text-sm">
            <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded">
              {data ? 'Custom traffic data loaded' : 'Using default traffic data'}
            </span>
            {darkVisitorData && (
              <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded">
                Custom agent data loaded
              </span>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-2 flex-wrap">
          <TabBtn id="overview" label="Overview" />
          <TabBtn id="channels" label="Channels" />
          <TabBtn id="engagement" label="Engagement" />
          <TabBtn id="trends" label="Trends" />
          <TabBtn id="agents" label="AI Agents" />
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-xl p-5 border-t-4 border-red-500">
                <p className="text-gray-400 text-xs uppercase tracking-wide">Likely Bot/AI</p>
                <p className="text-4xl font-bold text-red-500">{botSessions.toLocaleString()}</p>
                <p className="text-gray-500 text-sm">{botPct}% of direct</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-5 border-t-4 border-green-500">
                <p className="text-gray-400 text-xs uppercase tracking-wide">Likely Human</p>
                <p className="text-4xl font-bold text-green-500">{humanSessions.toLocaleString()}</p>
                <p className="text-gray-500 text-sm">{humanPct}% of direct</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-5 border-t-4 border-amber-500">
                <p className="text-gray-400 text-xs uppercase tracking-wide">Uncertain</p>
                <p className="text-4xl font-bold text-amber-500">{uncertainSessions.toLocaleString()}</p>
                <p className="text-gray-500 text-sm">{(100 - botPct - humanPct).toFixed(1)}% of direct</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-5 border-t-4 border-blue-500">
                <p className="text-gray-400 text-xs uppercase tracking-wide">Reported vs Real</p>
                <p className="text-4xl font-bold text-blue-500">{totalDirect.toLocaleString()}</p>
                <p className="text-gray-500 text-sm">→ ~{humanSessions.toLocaleString()} actual</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Direct Traffic Composition</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={directPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ pct }) => `${pct}%`}
                      labelLine={false}
                    >
                      {directPieData.map((_, i) => (
                        <Cell key={i} fill={pieColors[i]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [v.toLocaleString() + ' sessions', '']}
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Quality by Channel</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={channelStackedData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9ca3af" />
                    <YAxis type="category" dataKey="channel" width={65} stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="Likely Bot/AI" stackId="a" fill={COLORS.bot} />
                    <Bar dataKey="Likely Human" stackId="a" fill={COLORS.human} />
                    <Bar dataKey="Uncertain" stackId="a" fill={COLORS.uncertain} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Bot Traffic % by Channel</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={botPctData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="channel" stroke="#9ca3af" />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#9ca3af" />
                  <Tooltip formatter={(v) => [`${v}%`, 'Bot %']} contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="pct" fill={COLORS.bot} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHANNELS TAB */}
        {activeTab === 'channels' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 overflow-x-auto">
              <h2 className="text-lg font-semibold mb-4">Detailed Traffic Quality Breakdown</h2>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="pb-3 pr-4 text-gray-400 font-medium">Channel</th>
                    <th className="pb-3 pr-4 text-gray-400 font-medium">Quality</th>
                    <th className="pb-3 pr-4 text-gray-400 font-medium text-right">Sessions</th>
                    <th className="pb-3 pr-4 text-gray-400 font-medium text-right">Avg Pages</th>
                    <th className="pb-3 pr-4 text-gray-400 font-medium text-right">Avg Engagement</th>
                    <th className="pb-3 text-gray-400 font-medium text-right">% of Channel</th>
                  </tr>
                </thead>
                <tbody>
                  {channelQualityData.map((row, i) => (
                    <tr key={i} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                      <td className="py-3 pr-4 font-medium">{row.channel}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-1 rounded text-sm ${
                          row.traffic_quality === 'Likely Bot/AI' ? 'bg-red-500/20 text-red-400' :
                          row.traffic_quality === 'Likely Human' ? 'bg-green-500/20 text-green-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {row.traffic_quality}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right font-mono">{row.sessions.toLocaleString()}</td>
                      <td className="py-3 pr-4 text-right font-mono">{row.avg_pages}</td>
                      <td className="py-3 pr-4 text-right font-mono">{row.avg_engagement_sec}s</td>
                      <td className="py-3 text-right font-mono">{row.pct_of_channel}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ENGAGEMENT TAB */}
        {activeTab === 'engagement' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-900/30 to-green-900/30 rounded-xl p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">The Smoking Gun: Engagement Time</h2>
              <div className="flex justify-center items-center gap-8">
                <div>
                  <p className="text-6xl font-bold text-red-500">
                    {engagementData.find(d => d.channel === 'Direct')?.['Bot/AI'] || 0.5}s
                  </p>
                  <p className="text-gray-400 mt-2">Bot/AI Average</p>
                </div>
                <div className="text-4xl text-gray-500">vs</div>
                <div>
                  <p className="text-6xl font-bold text-green-500">
                    {engagementData.find(d => d.channel === 'Direct')?.['Human'] || 46}s
                  </p>
                  <p className="text-gray-400 mt-2">Human Average</p>
                </div>
              </div>
              <p className="text-gray-400 mt-4 text-lg">
                {Math.round((engagementData.find(d => d.channel === 'Direct')?.['Human'] || 46) / 
                (engagementData.find(d => d.channel === 'Direct')?.['Bot/AI'] || 0.5))}x difference in engagement
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Engagement by Channel & Quality</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="channel" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" label={{ value: 'Seconds', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                  <Tooltip formatter={(v) => [`${v}s`, '']} contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="Bot/AI" fill={COLORS.bot} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Human" fill={COLORS.human} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-red-400">Bot/AI Behavior Pattern</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Single page view only
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Under 5 seconds on site
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Zero conversions
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    No scroll or click events
                  </li>
                </ul>
              </div>
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-green-400">Human Behavior Pattern</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    2+ page views per session
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    15+ seconds engagement
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Conversion events triggered
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Natural scroll and interaction
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TRENDS TAB */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Daily Direct Traffic: Bot vs Human (30 Days)</h2>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={dailyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 11 }} interval={2} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="bot" stackId="1" stroke={COLORS.bot} fill={COLORS.bot} fillOpacity={0.6} name="Likely Bot/AI" />
                  <Area type="monotone" dataKey="uncertain" stackId="1" stroke={COLORS.uncertain} fill={COLORS.uncertain} fillOpacity={0.6} name="Uncertain" />
                  <Area type="monotone" dataKey="human" stackId="1" stroke={COLORS.human} fill={COLORS.human} fillOpacity={0.6} name="Likely Human" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Bot Traffic Ratio Over Time</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyTrendData.map(d => ({
                  ...d,
                  botRatio: Math.round((d.bot / (d.bot + d.human + d.uncertain)) * 100)
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 11 }} interval={2} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#9ca3af" />
                  <Tooltip formatter={(v) => [`${v}%`, 'Bot Ratio']} contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="botRatio" stroke={COLORS.bot} strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* AGENTS TAB */}
        {activeTab === 'agents' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Top Visiting Agents</h2>
              <div className="space-y-3">
                {agentData.map((agent, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500 w-6 font-mono">{i + 1}.</span>
                      <span className="font-medium">{agent.name}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        agent.type === 'AI' || agent.type === 'AI Assistant' ? 'bg-red-500/20 text-red-400' :
                        agent.type === 'Search' ? 'bg-blue-500/20 text-blue-400' :
                        agent.type === 'SEO' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {agent.type}
                      </span>
                    </div>
                    <span className="text-gray-300 font-mono">
                      {agent.visits >= 1000 ? `${(agent.visits / 1000).toFixed(1)}K` : agent.visits}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Agent Visits Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={agentData.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis type="category" dataKey="name" width={120} stroke="#9ca3af" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="visits" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm pt-8 border-t border-gray-800">
          <p>AI Traffic Attribution Analyzer | SMA Marketing</p>
          <p className="mt-1 text-xs">Upload your BigQuery export to analyze your own data</p>
        </div>
      </div>
    </div>
  );
}
