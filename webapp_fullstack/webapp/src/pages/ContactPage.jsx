import React, { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { 
  Mail, 
  Phone, 
  MessageCircle, 
  ArrowRight,
  Building2,
  Users,
  Shield,
  Clock,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [searchParams] = useSearchParams()
  const contactType = searchParams.get('type') || 'general'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: contactType === 'sales' ? '' : undefined,
    employees: contactType === 'sales' ? '' : undefined,
    phone: contactType === 'sales' ? '' : undefined,
    subject: '',
    message: '',
    contactType: contactType
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real implementation, this would send to your CRM/support system
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      if (contactType === 'sales') {
        toast.success('Thank you! Our sales team will contact you within 24 hours.')
      } else {
        toast.success('Thank you! We\'ll get back to you within 24 hours.')
      }
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        company: contactType === 'sales' ? '' : undefined,
        employees: contactType === 'sales' ? '' : undefined,
        phone: contactType === 'sales' ? '' : undefined,
        subject: '',
        message: '',
        contactType: contactType
      })
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const isSalesContact = contactType === 'sales'

  return (
    <div className="min-h-screen bg-discord-hero text-white py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className={`w-20 h-20 ${isSalesContact ? 'bg-purple-600' : 'bg-primary'} rounded-3xl flex items-center justify-center mx-auto mb-8 animate-glow`}>
            {isSalesContact ? (
              <Building2 className="w-10 h-10 text-white" />
            ) : (
              <MessageCircle className="w-10 h-10 text-white" />
            )}
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            {isSalesContact ? (
              <>Contact <span className="text-purple-400">Sales</span></>
            ) : (
              <>Get in <span className="text-primary-light">Touch</span></>
            )}
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {isSalesContact ? (
              'Ready to protect your organization with Privly Enterprise? Let\'s discuss your needs.'
            ) : (
              'Have questions about Privly ? Need help getting started? We\'re here to help.'
            )}
          </p>
        </div>

        {/* Contact Type Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-2 border border-white/10">
            <Link
              to="/contact?type=general"
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                !isSalesContact 
                  ? 'bg-primary text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              General Support
            </Link>
            <Link
              to="/contact?type=sales"
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                isSalesContact 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Sales Inquiry
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold mb-6">
              {isSalesContact ? 'Request Enterprise Quote' : 'Send us a Message'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {isSalesContact && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium mb-2">
                      Company *
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div>
                    <label htmlFor="employees" className="block text-sm font-medium mb-2">
                      Company Size
                    </label>
                    <select
                      id="employees"
                      name="employees"
                      value={formData.employees}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="" className="bg-gray-800">Select size</option>
                      <option value="1-10" className="bg-gray-800">1-10 employees</option>
                      <option value="11-50" className="bg-gray-800">11-50 employees</option>
                      <option value="51-200" className="bg-gray-800">51-200 employees</option>
                      <option value="201-1000" className="bg-gray-800">201-1000 employees</option>
                      <option value="1000+" className="bg-gray-800">1000+ employees</option>
                    </select>
                  </div>
                </div>
              )}

              {isSalesContact && (
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              )}

              {!isSalesContact && (
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="How can we help you?"
                  />
                </div>
              )}

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  {isSalesContact ? 'Tell us about your needs *' : 'Message *'}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder={
                    isSalesContact 
                      ? "Tell us about your security requirements, compliance needs, team size, or any specific questions..."
                      : "Describe your question or issue in detail..."
                  }
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full ${
                  isSalesContact ? 'bg-purple-600 hover:bg-purple-700' : 'bg-primary hover:bg-primary-dark'
                } py-3 px-6 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>{isSalesContact ? 'Request Quote' : 'Send Message'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Information & Additional Info */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-6">Other Ways to Reach Us</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold">
                      {isSalesContact ? 'Sales Team' : 'Support Team'}
                    </p>
                    <p className="text-gray-400">
                      {isSalesContact ? 'support@privly.app' : 'support@privly.app'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold">Phone</p>
                    <p className="text-gray-400">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold">Office Hours</p>
                    <p className="text-gray-400">Mon-Fri, 9 AM - 6 PM PST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4">What to Expect</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className={`w-6 h-6 ${isSalesContact ? 'bg-purple-600' : 'bg-primary'} rounded-full flex items-center justify-center text-sm font-bold`}>1</div>
                  <p className="text-gray-300">
                    {isSalesContact 
                      ? 'We\'ll review your requirements within 24 hours'
                      : 'We\'ll acknowledge your message within 4 hours'
                    }
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className={`w-6 h-6 ${isSalesContact ? 'bg-purple-600' : 'bg-primary'} rounded-full flex items-center justify-center text-sm font-bold`}>2</div>
                  <p className="text-gray-300">
                    {isSalesContact 
                      ? 'Schedule a personalized demo and consultation'
                      : 'Provide a detailed response or solution'
                    }
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className={`w-6 h-6 ${isSalesContact ? 'bg-purple-600' : 'bg-primary'} rounded-full flex items-center justify-center text-sm font-bold`}>3</div>
                  <p className="text-gray-300">
                    {isSalesContact 
                      ? 'Receive a custom quote tailored to your needs'
                      : 'Follow up to ensure your issue is resolved'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4">Quick Answers</h3>
              <p className="text-gray-300 mb-4">
                Looking for immediate answers? Check our FAQ section for common questions about features, pricing, and setup.
              </p>
              <Link
                to="/faq"
                className="inline-flex items-center space-x-2 text-primary hover:text-primary-light transition-colors"
              >
                <span>Browse FAQ</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {isSalesContact && (
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-4">Enterprise Features</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-300">Unlimited scrub actions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-300">Organization-wide rule sharing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-300">Advanced compliance reporting</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-300">Dedicated customer success manager</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}