import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
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
  
  const dashboardRef = useRef(null)
  const cardsRef = useRef(null)
  const streakRef = useRef(null)
  const chartRef = useRef(null)

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
      const hashParams = window.location.hash.split('server=')[1]
      const apiBase = 'https://relieved-sparrow-fairly.ngrok-free.app'
      console.log('[ANALYTICS] Fetching from:', `${apiBase}/api/user/${userId}/analytics`)
      console.log('[ANALYTICS] Hash:', window.location.hash)
      const response = await fetch(`${apiBase}/api/user/${userId}/analytics`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[ANALYTICS] Response not ok:', response.status, errorText)
        throw new Error(`Failed to fetch analytics: ${response.status} - ${errorText.substring(0, 100)}`)
      }
      
      const responseText = await response.text()
      console.log('[ANALYTICS] Response text:', responseText.substring(0, 200))
      
      try {
        const data = JSON.parse(responseText)
        setAnalytics(data)
      } catch (parseError) {
        console.error('[ANALYTICS] JSON parse error:', parseError)
        console.error('[ANALYTICS] Response was:', responseText.substring(0, 500))
        throw new Error(`Invalid JSON response: ${parseError.message}`)
      }
    } catch (err) {
      console.error('Analytics fetch error:', err)
      setError(err.message)
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

    // Animate chart container
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

  const lineChartData = {
    labels: analytics?.trends?.map(t => new Date(t.date).toLocaleDateString()) || [],
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* BMI Trend Chart */}
        {analytics.trends?.length > 0 && (
          <div ref={chartRef} className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-6">BMI Trend (Last 30 Days)</h3>
            <div className="h-64">
              <Line data={lineChartData} options={lineChartOptions} />
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
                {analytics.recentBMI.screenId?.slice(-6) || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Screen ID</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalyticsDashboard





