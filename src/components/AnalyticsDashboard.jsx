import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import api from '../lib/api'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

function AnalyticsDashboard({ userId }) {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showRecordDetails, setShowRecordDetails] = useState(false)
  
  const dashboardRef = useRef(null)
  const cardsRef = useRef(null)
  const streakRef = useRef(null)
  const chartRef = useRef(null)
  const weightChartRef = useRef(null)

  useEffect(() => {
    fetchAnalytics()
  }, [userId])

  useEffect(() => {
    if (analytics && dashboardRef.current) {
      animateComponents()
    }
  }, [analytics])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      console.log('[ANALYTICS] Fetching analytics for user:', userId)
      const data = await api.getUserAnalytics(userId)
      console.log('[ANALYTICS] Analytics data received:', data)
      setAnalytics(data)
    } catch (err) {
      console.error('Analytics fetch error:', err)
      setError(err?.message || 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  const animateComponents = () => {
    // Animate cards
    if (cardsRef.current) {
      gsap.fromTo(cardsRef.current.children,
        { opacity: 0, y: 30, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.6, 
          stagger: 0.1, 
          ease: "back.out(1.7)" 
        }
      )
    }

    // Animate streak counter
    if (streakRef.current && analytics?.streak?.currentStreak > 0) {
      gsap.fromTo(streakRef.current,
        { scale: 0, rotation: -180 },
        { 
          scale: 1, 
          rotation: 0,
          duration: 0.8,
          ease: "elastic.out(1, 0.5)",
          delay: 0.3
        }
      )
    }

    // Animate chart containers
    if (chartRef.current) {
      gsap.fromTo(chartRef.current,
        { opacity: 0, x: -50 },
        { 
          opacity: 1, 
          x: 0,
          duration: 0.8,
          delay: 0.5,
          ease: "power2.out"
        }
      )
    }

    if (weightChartRef.current) {
      gsap.fromTo(weightChartRef.current,
        { opacity: 0, x: 50 },
        { 
          opacity: 1, 
          x: 0,
          duration: 0.8,
          delay: 0.7,
          ease: "power2.out"
        }
      )
    }
  }

  const getStreakColor = (streak) => {
    if (streak >= 30) return 'text-purple-600 bg-purple-100'
    if (streak >= 14) return 'text-primary-600 bg-primary-100'
    if (streak >= 7) return 'text-green-600 bg-green-100'
    if (streak >= 3) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  const getStreakEmoji = (streak) => {
    if (streak >= 30) return '👑'
    if (streak >= 14) return '🔥'
    if (streak >= 7) return '⭐'
    if (streak >= 3) return '💪'
    return '🌱'
  }

  const getBMIColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'underweight': return 'text-blue-600 bg-blue-100'
      case 'normal': return 'text-green-600 bg-green-100'
      case 'overweight': return 'text-yellow-600 bg-yellow-100'
      case 'obese': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // Calculate recommended weight based on height
  const calculateWeightRecommendation = (heightCm) => {
    const heightM = heightCm / 100
    const minWeight = 18.5 * (heightM * heightM)
    const maxWeight = 24.9 * (heightM * heightM)
    const idealWeight = ((minWeight + maxWeight) / 2)
    
    return {
      min: Math.round(minWeight * 10) / 10,
      max: Math.round(maxWeight * 10) / 10,
      ideal: Math.round(idealWeight * 10) / 10
    }
  }

  // Calculate recommended daily water consumption based on height
  const calculateWaterRecommendation = (heightCm) => {
    const baseHeight = 150 // cm
    const baseWater = 1.5 // liters
    const additionalWater = Math.max(0, (heightCm - baseHeight) / 10) * 0.25
    const totalLiters = baseWater + additionalWater
    
    const waterLiters = Math.max(1.5, Math.min(4.0, totalLiters))
    const waterMl = Math.round(waterLiters * 1000)
    
    return {
      liters: parseFloat(waterLiters.toFixed(1)),
      ml: waterMl,
      cups: Math.round(waterMl / 250)
    }
  }

  const weightRecommendation = analytics?.recentBMI?.height ? calculateWeightRecommendation(analytics.recentBMI.height) : null
  const waterRecommendation = analytics?.recentBMI?.height ? calculateWaterRecommendation(analytics.recentBMI.height) : null

  const lineChartData = {
    labels: analytics?.trends?.map(t => {
      const date = new Date(t.date)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }) || [],
    datasets: [
      {
        label: 'BMI Trend',
        data: analytics?.trends?.map(t => t.bmi) || [],
        borderColor: '#F3841C',
        backgroundColor: 'rgba(243, 132, 28, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#F3841C',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  }

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#F3841C',
        borderWidth: 1,
        callbacks: {
          title: function(context) {
            const index = context[0].dataIndex
            const trend = analytics?.trends?.[index]
            if (trend?.timestamp) {
              const date = new Date(trend.timestamp)
              return date.toLocaleDateString('en-US', { 
                weekday: 'short',
                year: 'numeric',
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            }
            return context[0].label
          },
          afterBody: function(context) {
            const index = context[0].dataIndex
            const trend = analytics?.trends?.[index]
            if (trend?.screenName) {
              return [`Screen: ${trend.screenName}`]
            }
            return []
          },
          label: function(context) {
            return `BMI: ${context.parsed.y.toFixed(1)}`
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6b7280',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
        },
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
    },
  }

  const weightChartData = {
    labels: analytics?.trends?.map(t => new Date(t.date).toLocaleDateString()) || [],
    datasets: [
      {
        label: 'Weight Trend',
        data: analytics?.trends?.map(t => t.weight) || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  }

  const weightChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `Weight: ${context.parsed.y.toFixed(1)} kg`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          callback: function(value) {
            return value.toFixed(1) + ' kg';
          }
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
        },
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
    },
  }

  const doughnutData = {
    labels: Object.keys(analytics?.categoryDistribution || {}),
    datasets: [
      {
        data: Object.values(analytics?.categoryDistribution || {}),
        backgroundColor: [
          '#22c55e', // Normal - Green
          '#f59e0b', // Overweight - Yellow
          '#ef4444', // Obese - Red
          '#3b82f6', // Underweight - Blue
        ],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          color: '#6b7280',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
      },
    },
    animation: {
      animateRotate: true,
      duration: 2000,
    },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading-spinner w-12 h-12"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card text-center">
        <div className="text-red-600 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Analytics</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchAnalytics}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!analytics || analytics.totalRecords === 0) {
    return (
      <div className="card text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600">Start tracking your BMI to see analytics and trends!</p>
      </div>
    )
  }

  return (
    <div ref={dashboardRef} className="space-y-8">
      {/* Stats Cards */}
      <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Recent BMI Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Latest BMI</h3>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getBMIColor(analytics.recentBMI?.category)}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {analytics.recentBMI?.bmi}
          </div>
          <div className="text-sm text-gray-600 mb-2">
            {analytics.recentBMI?.category}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(analytics.recentBMI?.timestamp).toLocaleDateString()}
          </div>
        </div>

        {/* Current Streak Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Current Streak</h3>
            <div ref={streakRef} className={`w-10 h-10 rounded-full flex items-center justify-center ${getStreakColor(analytics.streak?.currentStreak)}`}>
              <span className="text-lg">{getStreakEmoji(analytics.streak?.currentStreak)}</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {analytics.streak?.currentStreak}
          </div>
          <div className="text-sm text-gray-600 mb-2">
            {analytics.streak?.currentStreak === 1 ? 'day' : 'days'}
          </div>
          <div className="text-xs text-gray-500">
            {analytics.streak?.isActive ? '🔥 Active' : '💤 Inactive'}
          </div>
        </div>

        {/* Total Records Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Records</h3>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {analytics.totalRecords}
          </div>
          <div className="text-sm text-gray-600 mb-2">
            measurements
          </div>
          <div className="text-xs text-gray-500">
            Since {new Date(analytics.firstRecord).toLocaleDateString()}
          </div>
        </div>

        {/* Average BMI Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Average BMI</h3>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {analytics.averageBMI}
          </div>
          <div className="text-sm text-gray-600 mb-2">
            overall average
          </div>
          <div className="text-xs text-gray-500">
            Best: {analytics.streak?.longestStreak} day streak
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="space-y-8">
        {/* BMI Trend Chart with Screen Info */}
        {analytics.trends?.length > 0 && (
          <div ref={chartRef} className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-6">BMI Records by Screen & Date</h3>
            <div className="h-64 mb-6">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
            
            {/* Screen Information Table - Collapsible */}
            <div className="mt-6 border-t pt-6">
              <button
                onClick={() => setShowRecordDetails(!showRecordDetails)}
                className="flex items-center justify-between w-full text-left mb-4 hover:opacity-80 transition-opacity"
              >
                <h4 className="text-lg font-semibold text-gray-900">Record Details</h4>
                <svg
                  className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${showRecordDetails ? 'transform rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showRecordDetails && (
                <div className="overflow-x-auto animate-in fade-in duration-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">Date & Time</th>
                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">BMI</th>
                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">Weight (kg)</th>
                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">Screen Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.trends.map((trend, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900">
                            {new Date(trend.timestamp || trend.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-3 px-4 text-gray-900 font-medium">{trend.bmi.toFixed(1)}</td>
                          <td className="py-3 px-4 text-gray-900">{trend.weight.toFixed(1)}</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              {trend.screenName || 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Other Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weight Trend Chart */}
          {analytics.trends?.length > 0 && (
            <div ref={weightChartRef} className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Weight Trend (Last 30 Days)</h3>
              <div className="h-64">
                <Line data={weightChartData} options={weightChartOptions} />
              </div>
            </div>
          )}

          {/* Category Distribution */}
          {Object.keys(analytics.categoryDistribution).length > 0 && (
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Category Distribution</h3>
              <div className="h-64">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations Section */}
      {(weightRecommendation || waterRecommendation) && analytics?.recentBMI?.height && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Health Recommendations</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weight Recommendation */}
            {weightRecommendation && (
              <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Weight Recommendation</h3>
                    <p className="text-gray-700 mb-3">
                      For your height of <span className="font-semibold">{analytics.recentBMI.height} cm</span>, the recommended weight range for a healthy BMI (18.5-24.9) is:
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center space-x-2 bg-white rounded-lg px-4 py-2 border-2 border-green-300">
                        <span className="text-2xl font-bold text-green-600">{weightRecommendation.min} - {weightRecommendation.max} kg</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Ideal: <span className="font-semibold">{weightRecommendation.ideal} kg</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Water Consumption Recommendation */}
            {waterRecommendation && (
              <div className="card bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Water Intake Recommendation</h3>
                    <p className="text-gray-700 mb-3">
                      Based on your height of <span className="font-semibold">{analytics.recentBMI.height} cm</span>, the recommended daily water intake is:
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center space-x-2 bg-white rounded-lg px-4 py-2 border-2 border-cyan-300">
                        <span className="text-2xl font-bold text-cyan-600">{waterRecommendation.liters} L</span>
                        <span className="text-sm text-gray-600">({waterRecommendation.ml} ml)</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        ≈ {waterRecommendation.cups} cups (250ml each)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {analytics.recentBMI && (
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-primary-600 mb-2">
                {analytics.recentBMI.height} cm
              </div>
              <div className="text-sm text-gray-600">Height</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-primary-600 mb-2">
                {analytics.recentBMI.weight} kg
              </div>
              <div className="text-sm text-gray-600">Weight</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-primary-600 mb-2">
                {analytics.recentBMI.screenName || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Screen Name</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalyticsDashboard





