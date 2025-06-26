import React, { useState } from 'react'
import { 
  Building2, 
  Shield, 
  Users, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Mail,
  Phone,
  Globe
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function EnterprisePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    employees: '',
    phone: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real implementation, this would send to your CRM/sales system
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      toast.success('Thank you! Our sales team will contact you within 24 hours.')
      setFormData({
        name: '',
        email: '',
        company: '',
        employees: '',
        phone: '',
        message: ''
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

  const features = [
    {
      icon: Shield,
      title: 'Advanced Security',
      description: 'Enterprise-grade encryption, audit logs, and compliance reporting'
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Organization-wide rule sharing, user management, and role-based access'
    },
    {
      icon: Zap,
      title: 'Custom Integration',
      description: 'API access, SSO integration, and custom deployment options'
    },
    {
      icon: Building2,
      title: 'Dedicated Support',
      description: 'Dedicated customer success manager and SLA guarantees'
    }
  ]

  const benefits = [
    'Unlimited scrub actions across your organization',
    'Unlimited custom rules with organization-wide sharing',
    'Advanced AI heuristic detection (runs locally)',
    'Custom data retention and audit export capabilities',
    'Organization-wide policy control and enforcement',
    'Priority support with dedicated customer success manager',
    'SLA guarantees and uptime commitments',
    'Custom training and onboarding for your team',
    'API access for custom integrations',
    'SSO integration (SAML, OIDC)',
    'Custom deployment options (on-premise available)',
    'Compliance reporting and audit trails'
  ]

  return (
    <div className="min-h-screen bg-discord-hero text-white py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-glow">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Enterprise <span className="text-purple-400">Security</span> <span className="text-lg text-yellow-400 font-normal">(Coming soon)</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Protect your organization's sensitive data at scale with advanced features, 
            dedicated support, and enterprise-grade security controls.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contact" className="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-xl text-lg font-semibold transition-all">
              Get Custom Quote
            </a>
            <a href="#features" className="border border-white/30 hover:border-purple-400 px-8 py-4 rounded-xl text-lg font-semibold transition-all">
              View Features
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <section id="features" className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Enterprise Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-purple-400/30 transition-all">
                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Everything You Need for Enterprise Security</h2>
              <p className="text-xl text-gray-300 mb-8">
                Privly Enterprise provides comprehensive data protection for organizations 
                of all sizes, with advanced features and dedicated support.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold mb-6">Trusted by Leading Organizations</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Fortune 500 Companies</h4>
                    <p className="text-sm text-gray-400">Protecting sensitive data across global teams</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Government Agencies</h4>
                    <p className="text-sm text-gray-400">Meeting strict compliance requirements</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Financial Services</h4>
                    <p className="text-sm text-gray-400">Protecting customer financial data</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section id="contact" className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-gray-300">
              Contact our sales team for a custom quote and personalized demo
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold mb-6">Get Custom Quote</h3>
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
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

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
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
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
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
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
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Tell us about your needs
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 resize-none"
                    placeholder="Tell us about your security requirements, compliance needs, or any specific questions..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-purple-600 hover:bg-purple-700 py-3 px-6 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Get Custom Quote</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="font-semibold">Sales Team</p>
                      <p className="text-gray-400">enterprise@privly.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="font-semibold">Phone</p>
                      <p className="text-gray-400">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="font-semibold">Office Hours</p>
                      <p className="text-gray-400">Mon-Fri, 9 AM - 6 PM PST</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-4">What Happens Next?</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <p className="text-gray-300">We'll review your requirements within 24 hours</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <p className="text-gray-300">Schedule a personalized demo and consultation</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <p className="text-gray-300">Receive a custom quote tailored to your needs</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <p className="text-gray-300">Start your enterprise deployment with dedicated support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}