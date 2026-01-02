import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

function ContactUsPage() {
  const containerRef = useRef(null)
  const formRef = useRef(null)
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      )
    }
    if (formRef.current) {
      gsap.fromTo(formRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.3, ease: "power2.out" }
      )
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real application, you would send this to your backend
    console.log('Form submitted:', formData)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', phone: '', message: '' })
    }, 3000)
  }

  return (
    <div className="min-h-screen gradient-bg py-12 px-4">
      <div className="max-w-4xl mx-auto" ref={containerRef}>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-4">Contact Us</h1>
          <p className="text-gray-600 text-lg">
            We'd love to hear from you. Get in touch with us for any queries, support, or feedback.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </h3>
                <p className="text-gray-700">
                  <a href="mailto:geetha@amsoftsolutions.com" className="text-primary-600 hover:underline">
                    geetha@amsoftsolutions.com
                  </a>
                </p>
                <p className="text-gray-700 mt-1">
                  <a href="mailto:satheesh@amsoftsolutions.com" className="text-primary-600 hover:underline">
                    satheesh@amsoftsolutions.com
                  </a>
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Phone
                </h3>
                <div className="space-y-1 text-gray-700">
                  <p>
                    <a href="tel:+918220692921" className="text-primary-600 hover:underline">
                      +91 8220692921
                    </a>
                  </p>
                  <p>
                    <a href="tel:+919884196298" className="text-primary-600 hover:underline">
                      +91 9884196298
                    </a>
                  </p>
                  <p>
                    <a href="tel:+919444069919" className="text-primary-600 hover:underline">
                      +91 9444069919
                    </a>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Address
                </h3>
                <p className="text-gray-700">
                  21, Womens SIDCO Industrial estate karuppur<br />
                  SALEM-636011<br />
                  TAMILNADU, India
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Hours</h3>
                <p className="text-gray-700">
                  Monday - Friday: 9:00 AM - 6:00 PM<br />
                  Saturday: 10:00 AM - 4:00 PM<br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send us a Message</h2>
            {submitted ? (
              <div className="bg-success-50 border border-success-200 rounded-lg p-4 mb-4">
                <p className="text-success-700 font-medium">Thank you for your message! We'll get back to you soon.</p>
              </div>
            ) : null}
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  placeholder="Your phone number"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="input-field"
                  placeholder="Your message"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a href="/" className="text-primary-600 hover:underline font-medium">← Back to Home</a>
        </div>
      </div>
    </div>
  )
}

export default ContactUsPage
