import { Button } from "@/components/ui/button";
import CustomButton from "@/components/ui/CustomButton";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { 
  pageLoadVariants, 
  staggerContainerVariants, 
  staggerItemVariants,
  sectionVariants,
  commonViewport 
} from "@/lib/animations";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarClock,
  Check,
  Clock,
  EyeOff,
  Layers3,
  MapPin,
  Search,
  ShieldCheck,
  SkipForward,
  Sparkles,
  Ticket,
  TicketCheck,
  UserCheck,
  Users,
  Users2,
  VolumeX,
} from "lucide-react";

const heroStats = [
  { value: "10+", label: "Clinics onboarding" },
  { value: "500+", label: "Expected patients" },
  { value: "18m", label: "Average visible wait" },
];

const problemPoints = [
  { 
    text: "Long and unpredictable waiting times", 
    icon: Clock,
    color: "amber",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    iconColor: "text-amber-600"
  },
  { 
    text: "No visibility into queue position", 
    icon: EyeOff,
    color: "red",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconColor: "text-red-600"
  },
  { 
    text: "Overcrowded waiting rooms", 
    icon: Users2,
    color: "orange",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    iconColor: "text-orange-600"
  },
  { 
    text: "Reception staff constantly interrupted", 
    icon: VolumeX,
    color: "rose",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    iconColor: "text-rose-600"
  },
];

const patientFeatures = [
  { icon: MapPin, text: "Find nearby clinics with a simple search flow." },
  { icon: Ticket, text: "Take a digital token before you arrive." },
  { icon: BarChart3, text: "Track position in real time from your phone." },
  { icon: Clock, text: "Reach the clinic close to your actual turn." },
];

const clinicFeatures = [
  { icon: Users, text: "Handle walk-ins and scheduled patients from one flow." },
  { icon: UserCheck, text: "Manage doctor-wise queues with less confusion." },
  { icon: SkipForward, text: "Move to next, skip, and update status quickly." },
  { icon: Activity, text: "Reduce crowding while giving patients live visibility." },
];

const steps = [
  { icon: Search, title: "Search clinics", desc: "Find nearby clinics using your location." },
  { icon: TicketCheck, title: "Get token", desc: "Join the queue digitally in seconds." },
  { icon: BarChart3, title: "Track live", desc: "See updates and estimated wait in real time." },
  { icon: Bell, title: "Arrive on time", desc: "Come in when your turn is close." },
];

const Index = () => {
  const [tokenNumber, setTokenNumber] = useState(12);
  const [isShimmerLoading, setIsShimmerLoading] = useState(true);

  // Simulate token count-up effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setTokenNumber(17);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Simulate shimmer loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShimmerLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      <div className="overflow-hidden relative">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 animate-gradient-xy" />
          <div className="absolute inset-0 bg-gradient-to-tr from-green-50/30 via-emerald-50/20 to-teal-50/30 animate-gradient-yx" />
        </div>

      {/* Floating Blur Shapes */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-20 left-10 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
        className="absolute top-40 right-10 h-96 w-96 rounded-full bg-teal-300/20 blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, 60, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 10,
        }}
        className="absolute bottom-20 left-1/3 h-64 w-64 rounded-full bg-green-300/20 blur-3xl"
      />

      <SectionWrapper className="content-spacing section-spacing">
        <motion.div 
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] md:gap-12"
        >
          <div className="max-w-2xl">
            <motion.div
              variants={staggerItemVariants}
              className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/80 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-muted-foreground shadow-sm"
            >
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
              <span className="hidden sm:inline">Minimal clinic queueing for patients and staff</span>
              <span className="sm:hidden">Smart clinic queues</span>
            </motion.div>

            <motion.h1
              variants={staggerItemVariants}
              className="mt-4 sm:mt-6 font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.02] tracking-tight text-foreground"
            >
              Make clinic visits feel calm, clear, and on time.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground md:text-xl"
            >
              Krama keeps your existing flow intact while giving the website a cleaner face for patients and clinics.
              Join digitally, track turns live, and reduce crowded waiting rooms.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link to="/patient/login">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Patient Login
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/clinic/login">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-emerald-200 bg-white/80 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-300"
                  >
                    Clinic Login
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-3">
              {heroStats.map((item) => (
                <div key={item.label} className="rounded-[24px] border border-border/70 bg-white/75 p-5 shadow-sm backdrop-blur">
                  <p className="font-display text-3xl font-bold text-primary">{item.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute inset-x-10 top-8 h-40 rounded-full bg-primary/10 blur-3xl" />
            <div className="glass-panel relative overflow-hidden rounded-[32px] p-6 md:p-8">
              <div className="flex items-center justify-between rounded-full border border-border/70 bg-background/80 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Live queue</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">CityCare Clinic</p>
                </div>
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="h-2 w-2 rounded-full bg-emerald-500"
                  />
                  <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">Active</div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-[1fr_0.88fr]">
                <div className="rounded-[28px] bg-gradient-to-br from-emerald-600 to-teal-600 px-6 py-8 text-primary-foreground shadow-[0_24px_60px_-32px_rgba(31,92,84,0.75)]">
                  <p className="text-sm uppercase tracking-[0.22em] text-primary-foreground/70">Your token</p>
                  <motion.p 
                    className="mt-3 font-display text-6xl font-bold"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.2, ease: "easeOut" }}
                  >
                    A-{tokenNumber}
                  </motion.p>

                  <div className="mt-8 grid grid-cols-2 gap-3">
                    <div className="rounded-[22px] bg-white/10 p-4">
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-primary-foreground/70">Now serving</p>
                        {isShimmerLoading && (
                          <motion.div
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="h-3 w-8 rounded-full bg-white/30"
                          />
                        )}
                      </div>
                      <AnimatePresence mode="wait">
                        {isShimmerLoading ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mt-2 h-8 w-12 rounded-full bg-white/20"
                          />
                        ) : (
                          <motion.p
                            key="serving"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.3 }}
                            className="mt-2 text-2xl font-semibold"
                          >
                            A-12
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="rounded-[22px] bg-white/10 p-4">
                      <p className="text-xs text-primary-foreground/70">Estimated wait</p>
                      <motion.p 
                        className="mt-2 text-2xl font-semibold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.4 }}
                      >
                        18 min
                      </motion.p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: CalendarClock, label: "Booked digitally", value: "Today, 10:30 AM" },
                    { icon: Bell, label: "Arrival reminder", value: "Notify 10 minutes before" },
                    { icon: ShieldCheck, label: "Less crowding", value: "Arrive only when needed" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-[24px] border border-border/70 bg-white/80 p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-secondary p-3">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{label}</p>
                          <p className="mt-1 font-medium text-foreground">{value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-[24px] border border-dashed border-border bg-background/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-accent/25 px-3 py-1 text-sm font-medium text-foreground">
                      5 patients ahead
                    </div>
                    <p className="text-sm text-muted-foreground">Track every update without calling reception.</p>
                  </div>
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </SectionWrapper>

      <section className="section-container px-4 py-16 md:px-8 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
            Why clinic visits feel frustrating today
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Common challenges that make healthcare experiences stressful and inefficient
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {problemPoints.map((problem, index) => (
            <motion.div
              key={problem.text}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ 
                y: -8,
                rotateY: 2,
                rotateX: -2,
                scale: 1.02,
                transition: { duration: 0.3, type: "spring", stiffness: 300 }
              }}
              className="group relative"
            >
              <div className={`
                relative rounded-[32px] border ${problem.borderColor} ${problem.bgColor} 
                p-8 shadow-lg hover:shadow-2xl transition-all duration-300 
                backdrop-blur-sm overflow-hidden
              `}>
                {/* Background gradient overlay */}
                <div className={`
                  absolute inset-0 bg-gradient-to-br from-transparent 
                  to-${problem.color}-100/20 opacity-0 group-hover:opacity-100 
                  transition-opacity duration-300
                `} />
                
                {/* Icon container */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className={`
                    relative z-10 w-16 h-16 rounded-2xl ${problem.bgColor} 
                    ${problem.borderColor} border flex items-center justify-center mb-6
                    group-hover:shadow-lg transition-all duration-300
                  `}
                >
                  <problem.icon className={`w-8 h-8 ${problem.iconColor}`} />
                </motion.div>

                {/* Problem text */}
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold text-foreground leading-tight mb-2">
                    {problem.text}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-1 h-1 rounded-full bg-current opacity-50"
                    />
                    <span>Common challenge</span>
                  </div>
                </div>

                {/* Decorative corner accent */}
                <div className={`
                  absolute top-4 right-4 w-8 h-8 rounded-full 
                  bg-gradient-to-br from-${problem.color}-200/20 to-transparent
                `} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section-container content-spacing section-spacing">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* For Patients Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="group relative"
          >
            <div className="rounded-[32px] bg-white/90 backdrop-blur-md p-8 shadow-xl ring-1 ring-border/50 border border-white/20 overflow-hidden">
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 p-4 shadow-lg"
                  >
                    <Ticket className="h-6 w-6 text-blue-600" />
                  </motion.div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.22em] text-blue-600 font-medium">For patients</p>
                    <h2 className="mt-1 font-display text-4xl font-bold text-foreground leading-tight">
                      Know when to leave, not when to wait.
                    </h2>
                  </div>
                </div>

                <div className="mt-10 space-y-4">
                  {patientFeatures.map((feature, index) => (
                    <motion.div
                      key={feature.text}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: index * 0.1,
                        ease: "easeOut"
                      }}
                      whileHover={{ x: 8 }}
                      className="group/item flex items-start gap-4 p-3 rounded-xl -mx-3 transition-all duration-300 hover:bg-blue-50/50"
                    >
                      <div className="relative">
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          transition={{ type: "spring", stiffness: 400 }}
                          className="mt-1 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 p-3 shadow-md group-hover/item:shadow-lg transition-all duration-300"
                        >
                          <feature.icon className="text-blue-600" size={20} />
                        </motion.div>
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true, amount: 0.2 }}
                          transition={{ 
                            duration: 0.3, 
                            delay: index * 0.1 + 0.2,
                            ease: "easeOut"
                          }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      </div>
                      <p className="text-gray-700 leading-relaxed group-hover/item:text-gray-900 transition-colors duration-300">
                        {feature.text}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* For Clinics Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="group relative"
          >
            <div className="rounded-[32px] bg-gradient-to-br from-emerald-700 via-teal-700 to-green-800 p-8 shadow-2xl ring-1 ring-emerald-600/30 border border-emerald-500/20 overflow-hidden relative">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="rounded-2xl bg-white/20 backdrop-blur-sm p-4 shadow-lg border border-white/30"
                  >
                    <Layers3 className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.22em] text-emerald-200 font-medium">For clinics</p>
                    <h2 className="mt-1 font-display text-4xl font-bold text-white leading-tight">
                      Keep the queue moving without changing your system.
                    </h2>
                  </div>
                </div>

                <div className="mt-10 space-y-4">
                  {clinicFeatures.map((feature, index) => (
                    <motion.div
                      key={feature.text}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: index * 0.1 + 0.3,
                        ease: "easeOut"
                      }}
                      whileHover={{ x: 8 }}
                      className="group/item flex items-start gap-4 p-3 rounded-xl -mx-3 transition-all duration-300 hover:bg-white/10"
                    >
                      <div className="relative">
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: -10 }}
                          transition={{ type: "spring", stiffness: 400 }}
                          className="mt-1 rounded-2xl bg-white/20 backdrop-blur-sm p-3 shadow-md group-hover/item:shadow-lg border border-white/30 transition-all duration-300"
                        >
                          <feature.icon className="text-white" size={20} />
                        </motion.div>
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true, amount: 0.2 }}
                          transition={{ 
                            duration: 0.3, 
                            delay: index * 0.1 + 0.5,
                            ease: "easeOut"
                          }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 text-emerald-900" />
                        </motion.div>
                      </div>
                      <p className="text-emerald-100 leading-relaxed group-hover/item:text-white transition-colors duration-300">
                        {feature.text}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-secondary/30 to-primary/10 section-spacing">
        <div className="section-container content-spacing">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <p className="text-sm uppercase tracking-[0.28em] text-primary font-medium">How it works</p>
            <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold text-foreground leading-tight">
              A simpler visit in four small steps.
            </h2>
          </motion.div>

          {/* Horizontal Stepper */}
          <div className="relative">
            {/* Connecting Line */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/60 to-primary/20 hidden md:block"
              style={{ transformOrigin: "left" }}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.2,
                    ease: "easeOut"
                  }}
                  className="group relative"
                >
                  {/* Step Card */}
                  <motion.div
                    whileHover={{ 
                      y: -8,
                      scale: 1.02,
                      transition: { duration: 0.3, type: "spring", stiffness: 300 }
                    }}
                    className="relative bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50"
                  >
                    {/* Step Number */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: index * 0.2 + 0.3,
                        ease: "easeOut"
                      }}
                      className="absolute -top-4 -right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg"
                    >
                      <span className="text-xs font-bold text-white">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </motion.div>

                    {/* Icon Container */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className="relative mx-auto w-20 h-20 mb-6"
                    >
                      {/* Background Circle */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full" />
                      
                      {/* Icon Circle */}
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: index * 0.2 + 0.4,
                          ease: "easeOut"
                        }}
                        className="relative w-full h-full bg-white rounded-full shadow-md flex items-center justify-center border-2 border-primary/30 group-hover:border-primary/60 transition-colors duration-300"
                      >
                        <step.icon className="w-8 h-8 text-primary" />
                      </motion.div>

                      {/* Pulse Animation */}
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          ease: "easeInOut",
                          delay: index * 0.5
                        }}
                        className="absolute inset-0 bg-primary/20 rounded-full"
                      />
                    </motion.div>

                    {/* Content */}
                    <div className="text-center">
                      <motion.h3
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: index * 0.2 + 0.6,
                          ease: "easeOut"
                        }}
                        className="text-xl font-bold text-foreground mb-3"
                      >
                        {step.title}
                      </motion.h3>
                      
                      <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: index * 0.2 + 0.8,
                          ease: "easeOut"
                        }}
                        className="text-muted-foreground leading-relaxed"
                      >
                        {step.desc}
                      </motion.p>
                    </div>

                    {/* Hover Highlight */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </motion.div>

                  {/* Mobile Connector Lines */}
                  {index < steps.length - 1 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ 
                        duration: 1, 
                        delay: index * 0.2 + 1,
                        ease: "easeOut"
                      }}
                      className="absolute top-1/2 left-full w-8 h-0.5 bg-gradient-to-r from-primary/30 to-primary/10 md:hidden"
                      style={{ transformOrigin: "left" }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-container content-spacing section-spacing relative overflow-hidden mt-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          <div className="rounded-2xl bg-gradient-to-br from-primary via-primary-light to-primary p-6 sm:p-8 md:p-12 lg:p-16 shadow-2xl shadow-primary/50 border border-primary-light/30 relative overflow-hidden noise-overlay">
            {/* Rich Gradient Background with Animation */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-light to-primary animate-gradient-slow-xy" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary-light/30 to-transparent" />
              {/* Radial Highlight */}
              <div className="absolute inset-0 bg-radial-highlight" />
            </div>

            {/* Premium Floating Blurred Circles */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Top-Left Circle */}
              <motion.div
                animate={{
                  x: [0, 30, 0],
                  y: [0, -20, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 22,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-10 -left-10 w-48 h-48 bg-gradient-to-br from-accent/15 to-primary/10 rounded-full blur-3xl"
              />
              
              {/* Bottom-Right Circle */}
              <motion.div
                animate={{
                  x: [0, -40, 0],
                  y: [0, 30, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 28,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 8,
                }}
                className="absolute -bottom-12 -right-12 w-56 h-56 bg-gradient-to-tr from-accent/12 to-primary/8 rounded-full blur-3xl"
              />

              {/* Additional Subtle Circles */}
              <motion.div
                animate={{
                  x: [0, 25, 0],
                  y: [0, -15, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 4,
                }}
                className="absolute top-1/4 right-1/4 w-32 h-32 bg-accent/8 rounded-full blur-2xl"
              />
            </div>

            {/* Parallax Layer */}
            <motion.div
              initial={{ y: 0 }}
              whileInView={{ y: -10 }}
              viewport={{ once: false, amount: 0.8 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-accent/5 to-transparent" />
            </motion.div>

            {/* Inner Shadow for Depth */}
            <div className="absolute inset-0 shadow-inner pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                className="text-sm uppercase tracking-[0.3em] text-white/80 font-medium"
              >
                Ready to use Krama?
              </motion.p>
              
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="mx-auto mt-4 max-w-3xl font-display text-4xl md:text-5xl font-bold leading-tight text-white"
              >
                Reduce waiting room chaos. Keep your system.
              </motion.h2>

              {/* Subheading */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                className="mt-6 text-lg text-green-100 font-medium"
              >
                Patients track their turn live. Staff manage queues without interruptions.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4"
              >
                {/* Patient Login Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Link to="/patient/login">
                    <div className="relative group">
                      {/* Enhanced Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-accent/30 to-primary/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                      <div className="absolute inset-0 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-all duration-400" />
                      
                      <CustomButton 
                        variant="secondary"
                        size="lg"
                        className="relative shadow-soft hover:shadow-hover"
                      >
                        Patient Login
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </CustomButton>
                    </div>
                  </Link>
                </motion.div>

                {/* Clinic Login Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Link to="/clinic/login">
                    <div className="relative group">
                      {/* Enhanced Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-accent/25 to-accent/25 rounded-full blur-2xl opacity-0 group-hover:opacity-80 transition-all duration-500" />
                      <div className="absolute inset-0 bg-white/15 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-all duration-400" />
                      
                      <CustomButton 
                        variant="outline"
                        size="lg"
                        className="relative bg-transparent text-white border-white/50 hover:bg-white/15 hover:border-white/70 backdrop-blur-sm shadow-soft hover:shadow-hover"
                      >
                        Clinic Login
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </CustomButton>
                    </div>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
                className="mt-8 flex items-center justify-center gap-8 text-sm text-green-100"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <span>Used by growing clinics</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <span>Setup in minutes</span>
                </div>
              </motion.div>

              {/* Simple Trust Message */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
                className="mt-8 flex flex-col items-center justify-center text-center"
              >
                <div className="flex items-center gap-3 text-green-100">
                  <ShieldCheck className="w-5 h-5 text-accent" />
                  <span className="text-base font-medium">
                    Built for real clinics. Designed to reduce waiting chaos.
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-4 left-4 w-2 h-2 bg-accent rounded-full opacity-60" />
            <div className="absolute top-4 right-4 w-2 h-2 bg-accent rounded-full opacity-60" />
            <div className="absolute bottom-4 left-4 w-2 h-2 bg-accent rounded-full opacity-60" />
            <div className="absolute bottom-4 right-4 w-2 h-2 bg-accent rounded-full opacity-60" />
          </div>
        </motion.div>
      </section>
      </div>
    </Layout>
  );
};

const Feature = ({ icon: Icon, text, dark = false }: any) => (
  <div className="flex items-start gap-4">
    <div className={`mt-1 rounded-2xl p-2.5 ${dark ? "bg-white/10" : "bg-secondary"}`}>
      <Icon className={dark ? "text-white" : "text-primary"} size={18} />
    </div>
    <p className={dark ? "text-primary-foreground/82" : "text-muted-foreground"}>{text}</p>
  </div>
);

const Step = ({ icon: Icon, title, desc }: any) => (
  <div className="rounded-[24px] border border-border/70 bg-background/80 p-6">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
      <Icon className="text-primary" size={22} />
    </div>
    <p className="mt-4 font-semibold">{title}</p>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
  </div>
);

export default Index;
