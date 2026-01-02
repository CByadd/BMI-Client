import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

function AboutUsPage() {
  const containerRef = useRef(null)
  const statsRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      )
    }
    if (statsRef.current) {
      gsap.fromTo(statsRef.current.children,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.6, stagger: 0.15, delay: 0.3, ease: "back.out(1.7)" }
      )
    }
  }, [])

  return (
    <div className="min-h-screen gradient-bg py-12 px-4">
      <div className="max-w-4xl mx-auto" ref={containerRef}>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-600 mb-4">About Well2Day</h1>
          <p className="text-xl text-gray-600">A Premium Wellness Company</p>
        </div>

        <div className="card mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Who We Are</h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Well2Day is a specialized company in manufacturing state-of-the-art BMI kiosks that provide exciting user 
            engagement through personalized health-related data. We are committed to helping individuals make informed 
            decisions about their health and wellness.
          </p>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Our mission is to make health monitoring accessible, simple, and engaging. We believe that small changes to 
            your diet and lifestyle can have a big impact on your health, and our BMI machines help you track your 
            progress on this journey.
          </p>
        </div>

        <div className="card mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">What We Do</h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            We provide BMI machines that tell you how healthy you are. Our machines are simple to use and easy to understand. 
            Well2Day can help you make small changes to your diet and lifestyle that will have a big impact on your health.
          </p>
          <div className="mt-6 space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">BMI Measurement</h3>
                <p className="text-gray-700">Accurate and instant BMI calculations with detailed health insights</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Health Tracking</h3>
                <p className="text-gray-700">Track your health progress over time with historical data and analytics</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">SMS Notifications</h3>
                <p className="text-gray-700">Receive health information, tips, and updates via SMS</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Dynamic Content</h3>
                <p className="text-gray-700">Display dynamic text content, flash news, camps, awareness programs, and more</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Our System Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Scroller</h3>
              <p className="text-gray-700 text-sm">
                Dynamic text contents can be displayed at the top row of the TV (like Flash News, Camps and dates, 
                visiting hours, seminars, awareness programs, etc.)
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Maintenance</h3>
              <p className="text-gray-700 text-sm">
                Trouble Free, Less maintenance, Reliable. Continuous Remote Monitoring by Well2Day personnel
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Attraction</h3>
              <p className="text-gray-700 text-sm">
                The machine is a crowd puller, it can create more footfalls wherever it is placed.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">SMS</h3>
              <p className="text-gray-700 text-sm">
                People who use the kiosk will get information (like IEC toll free number, schemes, notes, etc) on their 
                mobile as SMS. This can be customized location wise for better reach.
              </p>
            </div>
          </div>
        </div>

        <div className="card mb-8" ref={statsRef}>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Our Reach</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl">
              <div className="text-4xl font-bold text-primary-600 mb-2">5M+</div>
              <div className="text-gray-700 font-medium">Users</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-accent-50 to-accent-100 rounded-xl">
              <div className="text-4xl font-bold text-accent-600 mb-2">150+</div>
              <div className="text-gray-700 font-medium">Machines Installed</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Company Information</h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Ownership</h3>
              <p>Well2Day is owned and operated by Amsoft Services</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
              <p>
                21, Womens SIDCO Industrial estate karuppur<br />
                SALEM-636011<br />
                TAMILNADU, India
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Contact</h3>
              <p className="mb-2">
                <strong>Email:</strong> <a href="mailto:geetha@amsoftsolutions.com" className="text-primary-600 hover:underline">geetha@amsoftsolutions.com</a>, 
                <a href="mailto:satheesh@amsoftsolutions.com" className="text-primary-600 hover:underline ml-1">satheesh@amsoftsolutions.com</a>
              </p>
              <p>
                <strong>Phone:</strong> <a href="tel:+918220692921" className="text-primary-600 hover:underline">+91 8220692921</a>, 
                <a href="tel:+919884196298" className="text-primary-600 hover:underline ml-1">+91 9884196298</a>, 
                <a href="tel:+919444069919" className="text-primary-600 hover:underline ml-1">+91 9444069919</a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a href="/" className="text-primary-600 hover:underline font-medium">← Back to Home</a>
        </div>
      </div>
    </div>
  )
}

export default AboutUsPage
