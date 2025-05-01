import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaCheck, FaTimes, FaArrowRight, FaQuestion, FaInfoCircle, FaShippingFast } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Plan feature component
const PlanFeature = ({ included, text }: { included: boolean; text: string }) => (
  <div className="flex items-center mb-3">
    {included ? (
      <FaCheck className="text-cyan-400 mr-2 flex-shrink-0" />
    ) : (
      <FaTimes className="text-gray-500 mr-2 flex-shrink-0" />
    )}
    <span className={included ? "text-gray-300" : "text-gray-500"}>{text}</span>
  </div>
);

// Tooltip component
const Tooltip = ({ text }: { text: string }) => (
  <div className="group relative">
    <FaInfoCircle className="text-gray-500 hover:text-cyan-400 transition-colors cursor-help ml-1" />
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-xs text-gray-300 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none border border-cyan-500/30">
      {text}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
);

const Plans = () => {
  const navigate = useNavigate();
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  // Handle plan selection
  const handleSelectPlan = (planType: string) => {
    // Navigate to order form with plan type
    navigate(`/order?plan=${planType}`);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-gray-200">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Choose Your NFC Card Plan
          </motion.h1>
          <motion.p
            className="text-xl text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Select the perfect plan that fits your needs and start creating your digital business card today
          </motion.p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Plan 1: Standard */}
          <motion.div
            className={`relative bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border transition-all duration-300 ${
              hoveredPlan === 'standard'
                ? 'border-cyan-400 shadow-lg shadow-cyan-500/20 transform scale-[1.02] z-10'
                : 'border-gray-700/50'
            }`}
            onMouseEnter={() => setHoveredPlan('standard')}
            onMouseLeave={() => setHoveredPlan(null)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Plan Header */}
            <div className="p-6 border-b border-gray-700/50">
              <h3 className="text-xl font-bold mb-2">Standard NFC Card</h3>
              <p className="text-gray-400 text-sm mb-4">Basic digital business card</p>
              <div className="flex items-end">
                <span className="text-3xl font-bold text-cyan-400">35 DT</span>
                <span className="text-gray-500 ml-2">/ card</span>
              </div>
            </div>

            {/* Plan Features */}
            <div className="p-6">
              <PlanFeature included={true} text="Pre-designed template" />
              <PlanFeature included={true} text="Basic NFC functionality" />
              <PlanFeature included={true} text="Up to 5 social links" />
              <PlanFeature included={true} text="Contact information" />
              <PlanFeature included={false} text="Custom logo upload" />
              <PlanFeature included={false} text="Color customization" />
              <PlanFeature included={false} text="Premium templates" />
              <PlanFeature included={false} text="QR code integration" />

              <button
                onClick={() => handleSelectPlan('standard')}
                className="w-full mt-6 py-3 px-4 rounded-md bg-transparent border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 transition-all duration-200 flex items-center justify-center group"
              >
                <span>Get Started</span>
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Plan 2: Logo Customization */}
          <motion.div
            className={`relative bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border transition-all duration-300 ${
              hoveredPlan === 'logo'
                ? 'border-purple-400 shadow-lg shadow-purple-500/20 transform scale-[1.05] z-20'
                : 'border-gray-700/50'
            }`}
            onMouseEnter={() => setHoveredPlan('logo')}
            onMouseLeave={() => setHoveredPlan(null)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {/* Popular Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold py-1 px-3 rounded-bl-lg">
              POPULAR
            </div>

            {/* Plan Header */}
            <div className="p-6 border-b border-gray-700/50">
              <h3 className="text-xl font-bold mb-2">Logo Customization</h3>
              <p className="text-gray-400 text-sm mb-4">Personalized with your brand</p>
              <div className="flex items-end">
                <span className="text-3xl font-bold text-purple-400">45 DT</span>
                <span className="text-gray-500 ml-2">/ card</span>
              </div>
            </div>

            {/* Plan Features */}
            <div className="p-6">
              <PlanFeature included={true} text="All Standard features" />
              <PlanFeature included={true} text="Custom logo upload" />
              <PlanFeature included={true} text="Basic color customization" />
              <PlanFeature included={true} text="Up to 10 social links" />
              <PlanFeature included={true} text="Real-time preview" />
              <PlanFeature included={false} text="Advanced customization" />
              <PlanFeature included={false} text="Custom patterns & textures" />
              <PlanFeature included={false} text="QR code integration" />

              <button
                onClick={() => handleSelectPlan('logo')}
                className="w-full mt-6 py-3 px-4 rounded-md bg-transparent border border-purple-500 text-purple-400 hover:bg-purple-500/10 transition-all duration-200 flex items-center justify-center group"
              >
                <span>Get Started</span>
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Plan 3: Full Customization */}
          <motion.div
            className={`relative bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border transition-all duration-300 ${
              hoveredPlan === 'full'
                ? 'border-pink-400 shadow-lg shadow-pink-500/20 transform scale-[1.02] z-10'
                : 'border-gray-700/50'
            }`}
            onMouseEnter={() => setHoveredPlan('full')}
            onMouseLeave={() => setHoveredPlan(null)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {/* Plan Header */}
            <div className="p-6 border-b border-gray-700/50">
              <h3 className="text-xl font-bold mb-2">Full Customization</h3>
              <p className="text-gray-400 text-sm mb-4">Complete creative control</p>
              <div className="flex items-end">
                <span className="text-3xl font-bold text-pink-400">55 DT</span>
                <span className="text-gray-500 ml-2">/ card</span>
              </div>
              <div className="mt-1 text-green-400 text-sm font-medium flex items-center">
                <FaShippingFast className="mr-1" /> Free Shipping
              </div>
            </div>

            {/* Plan Features */}
            <div className="p-6">
              <PlanFeature included={true} text="All Logo features" />
              <PlanFeature included={true} text="Full color customization" />
              <PlanFeature included={true} text="Custom patterns & textures" />
              <PlanFeature included={true} text="QR code integration" />
              <PlanFeature included={true} text="Unlimited social links" />
              <PlanFeature included={true} text="Premium templates" />
              <PlanFeature included={true} text="Priority shipping" />
              <PlanFeature included={true} text="Premium support" />

              <button
                onClick={() => handleSelectPlan('full')}
                className="w-full mt-6 py-3 px-4 rounded-md bg-transparent border border-pink-500 text-pink-400 hover:bg-pink-500/10 transition-all duration-200 flex items-center justify-center group"
              >
                <span>Get Started</span>
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-5">
              <h3 className="font-bold mb-2 flex items-center">
                <FaQuestion className="text-cyan-400 mr-2" />
                What's included with my NFC card?
              </h3>
              <p className="text-gray-400">
                Each NFC card comes pre-programmed with your unique digital business card URL. When someone taps your card with their smartphone, they'll instantly see your digital profile with all your contact information and links.
              </p>
            </div>

            <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-5">
              <h3 className="font-bold mb-2 flex items-center">
                <FaQuestion className="text-cyan-400 mr-2" />
                How do I customize my card?
              </h3>
              <p className="text-gray-400">
                After selecting your plan, you'll be taken to our easy-to-use editor where you can customize your digital card according to your plan's features. Once you're satisfied with your design, you can place your order for physical cards.
              </p>
            </div>

            <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-5">
              <h3 className="font-bold mb-2 flex items-center">
                <FaQuestion className="text-cyan-400 mr-2" />
                How does payment work?
              </h3>
              <p className="text-gray-400">
                We offer cash on delivery for all our NFC card orders. You'll only pay when your cards are delivered to your address. No upfront payment is required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;
