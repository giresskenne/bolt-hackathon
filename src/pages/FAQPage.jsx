import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const FAQPage = () => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqData = [
    {
      question: "What is this service?",
      answer: "Our service provides advanced text processing and content management solutions to help you streamline your workflow and improve productivity."
    },
    {
      question: "How does pricing work?",
      answer: "We offer flexible pricing plans to suit different needs. You can choose from our Basic, Pro, or Enterprise plans, each with different features and usage limits."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes, we offer a free trial period so you can explore our features and see how our service fits your needs before committing to a paid plan."
    },
    {
      question: "How secure is my data?",
      answer: "We take data security seriously. All data is encrypted in transit and at rest, and we follow industry best practices for data protection and privacy."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period."
    },
    {
      question: "Do you offer customer support?",
      answer: "We provide comprehensive customer support through multiple channels including email, chat, and our knowledge base."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our service, pricing, and features.
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {item.question}
                </h3>
                <div className="flex-shrink-0">
                  {openItems[index] ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </button>
              
              {openItems[index] && (
                <div className="px-6 pb-5">
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-gray-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Still have questions?
            </h2>
            <p className="text-gray-600 mb-6">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;