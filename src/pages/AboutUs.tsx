import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Building2, 
  Clock, 
  Shield, 
  Smartphone, 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle,
  ArrowRight,
  CheckCircle
} from "lucide-react";
const AboutUs = () => {
  return (
    <>
      {/* Hero Section */}
      <div className="bg-[#00555A] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About Krama
          </h1>
          <p className="text-xl md:text-2xl text-[#00FFF0] max-w-3xl mx-auto">
            Revolutionizing healthcare queue management with smart, efficient, and patient-centric solutions
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        
        {/* Mission Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#0F172A] mb-6">Our Mission</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            To transform healthcare experience by eliminating wait times and streamlining 
            patient flow through innovative digital queue management. We believe that quality 
            healthcare starts with a smooth, stress-free journey from home to consultation.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-[#0F172A] mb-12">Why Choose Krama?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 bg-[#00555A]/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-[#00555A]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#0F172A]">Save Time</h3>
              <p className="text-gray-600">Join queues remotely and get real-time updates on your waiting time</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 bg-[#00FFF0]/10 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-[#00555A]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#0F172A]">Mobile First</h3>
              <p className="text-gray-600">Manage appointments and queues from your smartphone, anywhere anytime</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 bg-[#FFC107]/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-[#0F172A]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#0F172A]">Secure & Private</h3>
              <p className="text-gray-600">Your health data is protected with enterprise-grade security</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#0F172A]">For Patients</h3>
              <p className="text-gray-600">Book appointments, track queue status, and reduce waiting time</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#0F172A]">For Clinics</h3>
              <p className="text-gray-600">Streamline patient flow, reduce overcrowding, and improve efficiency</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 bg-[#00FFF0]/10 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-[#00555A]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#0F172A]">Real-time Updates</h3>
              <p className="text-gray-600">Get instant notifications about your queue position and appointment status</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-[#0F172A] mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00555A] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2 text-[#0F172A]">Register</h3>
              <p className="text-gray-600 text-sm">Sign up as patient or clinic</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00555A] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2 text-[#0F172A]">Book/Join</h3>
              <p className="text-gray-600 text-sm">Book appointment or join queue</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00555A] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2 text-[#0F172A]">Track</h3>
              <p className="text-gray-600 text-sm">Monitor your queue status</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00555A] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                4
              </div>
              <h3 className="font-semibold mb-2 text-[#0F172A]">Visit</h3>
              <p className="text-gray-600 text-sm">Arrive just in time for consultation</p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-2xl shadow-sm p-12">
          <h2 className="text-3xl font-bold text-center text-[#0F172A] mb-12">Get in Touch</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold mb-6 text-[#0F172A]">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#00555A]" />
                  <div>
                    <p className="font-medium text-[#0F172A]">Head Office</p>
                    <p className="text-gray-600">123 Healthcare Avenue, Medical District, Bangalore - 560001</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#00555A]" />
                  <div>
                    <p className="font-medium text-[#0F172A]">Phone</p>
                    <p className="text-gray-600">+91 80 1234 5678</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#00555A]" />
                  <div>
                    <p className="font-medium text-[#0F172A]">Email</p>
                    <p className="text-gray-600">support@krama.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-[#00555A]" />
                  <div>
                    <p className="font-medium text-[#0F172A]">Support Hours</p>
                    <p className="text-gray-600">Monday - Saturday: 9:00 AM - 8:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-6 text-[#0F172A]">Quick Links</h3>
              <div className="space-y-3">
                <Link to="/patient/signup" className="flex items-center gap-2 text-[#00555A] hover:text-[#00555A]/80 transition-all duration-200">
                  <CheckCircle className="w-4 h-4" />
                  Patient Registration
                </Link>
                <Link to="/clinic/register" className="flex items-center gap-2 text-[#00555A] hover:text-[#00555A]/80 transition-all duration-200">
                  <CheckCircle className="w-4 h-4" />
                  Clinic Registration
                </Link>
                <Link to="/patient/login" className="flex items-center gap-2 text-[#00555A] hover:text-[#00555A]/80 transition-all duration-200">
                  <CheckCircle className="w-4 h-4" />
                  Patient Login
                </Link>
                <Link to="/clinic/login" className="flex items-center gap-2 text-[#00555A] hover:text-[#00555A]/80 transition-all duration-200">
                  <CheckCircle className="w-4 h-4" />
                  Clinic Login
                </Link>
              </div>
              
              <div className="mt-8">
                <Button asChild className="w-full bg-[#00555A] hover:opacity-90">
                  <Link to="/">
                    Back to Home <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutUs;
