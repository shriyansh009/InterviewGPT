import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
  IconButton,
  Input,
  Textarea,
  Checkbox,
} from "@material-tailwind/react";
import {
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  BoltIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/solid";
import { PageTitle, Footer } from "@/widgets/layout";
import { FeatureCard } from "@/widgets/cards";

// ─── Static data ────────────────────────────────────────────────────────────

const features = [
  {
    color: "blue",
    title: "ATS Score Analysis",
    icon: ChartBarIcon,
    description:
      "Upload your resume and job description. Our AI instantly calculates your ATS compatibility score and highlights exactly what's missing.",
  },
  {
    color: "green",
    title: "Smart Question Generation",
    icon: AcademicCapIcon,
    description:
      "Get tailored interview questions — technical, behavioral, and situational — generated specifically from your resume and the target role.",
  },
  {
    color: "purple",
    title: "AI Mock Interview Chat",
    icon: ChatBubbleLeftRightIcon,
    description:
      "Practice with an AI interviewer powered by Gemini. Get real-time feedback on your answers using RAG-driven contextual responses.",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Upload your resume",
    description:
      "Drop in your PDF or DOCX resume. We extract and index every detail automatically.",
    icon: DocumentTextIcon,
  },
  {
    step: "02",
    title: "Paste the job description",
    description:
      "Add the JD you're targeting. Our pipeline compares it against your profile in seconds.",
    icon: BoltIcon,
  },
  {
    step: "03",
    title: "Ace the interview",
    description:
      "Review your ATS score, fill skill gaps, and practice with AI-generated questions until you're confident.",
    icon: ShieldCheckIcon,
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative flex h-screen content-center items-center justify-center pt-16 pb-32">
        <div className="absolute top-0 h-full w-full bg-[url('/img/background4.jpg')] bg-cover bg-center" />
        <div className="absolute top-0 h-full w-full bg-black/70 bg-cover bg-center" />
        <div className="max-w-8xl container relative mx-auto">
          <div className="flex flex-wrap items-center">
            <div className="ml-auto mr-auto w-full px-4 text-center lg:w-8/12">
              <Typography
                variant="h1"
                color="white"
                className="mb-6 font-black"
              >
                Land your dream job with AI-powered interview prep.
              </Typography>
              <Typography variant="lead" color="white" className="opacity-80">
                InterviewAI analyses your resume against any job description,
                generates personalised interview questions, and lets you
                practise with a Gemini-powered AI — all in one place.
              </Typography>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <a href="/sign-up">
                  <Button size="lg" color="white">
                    Get started free
                  </Button>
                </a>
                <a href="/sign-in">
                  <Button size="lg" variant="outlined" color="white">
                    Log in
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Feature cards ────────────────────────────────────────────────── */}
      <section className="-mt-32 bg-white px-4 pb-20 pt-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ color, title, icon, description }) => (
              <FeatureCard
                key={title}
                color={color}
                title={title}
                icon={React.createElement(icon, {
                  className: "w-5 h-5 text-white",
                })}
                description={description}
              />
            ))}
          </div>

          {/* ── How it works ─────────────────────────────────────────────── */}
          <div className="mt-32 flex flex-wrap items-center">
            <div className="mx-auto -mt-8 w-full px-4 md:w-5/12">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-gray-900 p-2 text-center shadow-lg">
                <BoltIcon className="h-8 w-8 text-white" />
              </div>
              <Typography
                variant="h3"
                className="mb-3 font-bold"
                color="blue-gray"
              >
                From resume to offer — in three steps
              </Typography>
              <Typography className="mb-8 font-normal text-blue-gray-500">
                Stop guessing what recruiters want. InterviewAI reads your
                resume the same way an ATS does, spots the gaps, and coaches
                you through every question you're likely to face.
                <br />
                <br />
                Powered by Google Gemini, LangChain RAG, and FAISS vector
                search — so every answer you practise is grounded in your
                actual experience.
              </Typography>
              <a href="/sign-up">
                <Button variant="filled">Start for free</Button>
              </a>
            </div>

            <div className="mx-auto mt-24 flex w-full justify-center px-4 md:w-4/12 lg:mt-0">
              <Card className="shadow-lg border shadow-gray-500/10 rounded-lg">
                <CardHeader floated={false} className="relative h-56">
                  <img
                    alt="AI interview preparation"
                    src="/img/teamwork.png"
                    className="h-full w-full object-cover"
                  />
                </CardHeader>
                <CardBody>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    AI-Powered
                  </Typography>
                  <Typography
                    variant="h5"
                    color="blue-gray"
                    className="mb-3 mt-2 font-bold"
                  >
                    Your personal interview coach
                  </Typography>
                  <Typography className="font-normal text-blue-gray-500">
                    Upload once, practise endlessly. InterviewAI remembers your
                    resume so every mock interview feels tailor-made.
                  </Typography>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ── Step-by-step section ─────────────────────────────────────────── */}
      <section className="px-4 pt-20 pb-48">
        <div className="container mx-auto">
          <PageTitle section="How It Works" heading="Three steps to interview confidence">
            Upload your resume, paste the job description, and let InterviewAI
            handle the rest — from ATS scoring to live mock interviews.
          </PageTitle>

          <div className="mt-24 grid grid-cols-1 gap-12 gap-x-24 md:grid-cols-3">
            {howItWorks.map(({ step, title, description, icon }) => (
              <Card
                key={step}
                color="transparent"
                shadow={false}
                className="text-center text-blue-gray-900"
              >
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-blue-gray-900 shadow-lg shadow-gray-500/20">
                  {React.createElement(icon, {
                    className: "w-5 h-5 text-white",
                  })}
                </div>
                <Typography
                  variant="small"
                  className="mb-1 font-bold tracking-widest text-blue-gray-400 uppercase"
                >
                  Step {step}
                </Typography>
                <Typography variant="h5" color="blue-gray" className="mb-2">
                  {title}
                </Typography>
                <Typography className="font-normal text-blue-gray-500">
                  {description}
                </Typography>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact / CTA ────────────────────────────────────────────────── */}
      <section className="relative bg-white py-24 px-4">
        <div className="container mx-auto">
          <PageTitle section="Get In Touch" heading="Have questions? We'd love to help.">
            Whether you're a job seeker, recruiter, or organisation looking to
            license InterviewAI, drop us a message and we'll get back to you
            within 24 hours.
          </PageTitle>

          <form className="mx-auto w-full mt-12 lg:w-5/12">
            <div className="mb-8 flex gap-8">
              <Input variant="outlined" size="lg" label="Full Name" />
              <Input variant="outlined" size="lg" label="Email Address" />
            </div>
            <Textarea variant="outlined" size="lg" label="Message" rows={8} />
            <Checkbox
              label={
                <Typography
                  variant="small"
                  color="gray"
                  className="flex items-center font-normal"
                >
                  I agree to the
                  <a
                    href="#"
                    className="font-medium transition-colors hover:text-gray-900"
                  >
                    &nbsp;Terms and Conditions
                  </a>
                </Typography>
              }
              containerProps={{ className: "-ml-2.5" }}
            />
            <Button variant="gradient" size="lg" className="mt-8" fullWidth>
              Send Message
            </Button>
          </form>
        </div>
      </section>

      <div className="bg-white">
        <Footer />
      </div>
    </>
  );
}

export default Home;