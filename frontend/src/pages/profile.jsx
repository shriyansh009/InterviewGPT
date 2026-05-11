import { Avatar, Typography, Button } from "@material-tailwind/react";
import {
  MapPinIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/solid";
import { Footer } from "@/widgets/layout";

export function Profile() {
  return (
    <>
      <section className="relative block h-[50vh]">
        <div className="bg-profile-background absolute top-0 h-full w-full bg-[url('/img/background-1.jpg')] bg-cover bg-center" />
        <div className="absolute top-0 h-full w-full bg-black/60 bg-cover bg-center" />
      </section>

      <section className="relative bg-white py-16">
        <div className="relative mb-6 -mt-40 flex w-full px-4 min-w-0 flex-col break-words bg-white">
          <div className="container mx-auto">

            {/* ── Top row: avatar + name + stats ── */}
            <div className="flex flex-col lg:flex-row justify-between">
              <div className="relative flex gap-6 items-start">
                <div className="-mt-20 w-40">
                  <Avatar
                    src="/img/88087.jpg"
                    alt="Profile picture"
                    variant="circular"
                    className="h-full w-full"
                  />
                </div>
                <div className="flex flex-col mt-2">
                  <Typography variant="h4" color="blue-gray">
                    Jenna Stones
                  </Typography>
                  <Typography
                    variant="paragraph"
                    color="gray"
                    className="!mt-0 font-normal"
                  >
                    jena@mail.com
                  </Typography>
                </div>
              </div>

              <div className="mt-10 mb-10 flex lg:flex-col justify-between items-center lg:justify-end lg:mb-0 lg:px-4 flex-wrap lg:-mt-5">
                <Button className="bg-gray-900 w-fit lg:ml-auto">
                  Edit Profile
                </Button>
                <div className="flex justify-start py-4 pt-8 lg:pt-4">
                  <div className="mr-4 p-3 text-center">
                    <Typography
                      variant="lead"
                      color="blue-gray"
                      className="font-bold uppercase"
                    >
                      5
                    </Typography>
                    <Typography
                      variant="small"
                      className="font-normal text-blue-gray-500"
                    >
                      Resumes
                    </Typography>
                  </div>
                  <div className="mr-4 p-3 text-center">
                    <Typography
                      variant="lead"
                      color="blue-gray"
                      className="font-bold uppercase"
                    >
                      12
                    </Typography>
                    <Typography
                      variant="small"
                      className="font-normal text-blue-gray-500"
                    >
                      Analyses
                    </Typography>
                  </div>
                  <div className="p-3 text-center lg:mr-4">
                    <Typography
                      variant="lead"
                      color="blue-gray"
                      className="font-bold uppercase"
                    >
                      84%
                    </Typography>
                    <Typography
                      variant="small"
                      className="font-normal text-blue-gray-500"
                    >
                      Avg ATS
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Meta info ── */}
            <div className="-mt-4 container space-y-2">
              <div className="flex items-center gap-2">
                <MapPinIcon className="-mt-px h-4 w-4 text-blue-gray-500" />
                <Typography className="font-medium text-blue-gray-500">
                  Los Angeles, California
                </Typography>
              </div>
              <div className="flex items-center gap-2">
                <BriefcaseIcon className="-mt-px h-4 w-4 text-blue-gray-500" />
                <Typography className="font-medium text-blue-gray-500">
                  Targeting: Senior Software Engineer roles
                </Typography>
              </div>
              <div className="flex items-center gap-2">
                <AcademicCapIcon className="-mt-px h-4 w-4 text-blue-gray-500" />
                <Typography className="font-medium text-blue-gray-500">
                  University of Computer Science
                </Typography>
              </div>
            </div>

            {/* ── Bio ── */}
            <div className="mb-10 py-6">
              <div className="flex w-full flex-col items-start lg:w-1/2">
                <Typography className="mb-6 font-normal text-blue-gray-500">
                  Full-stack developer with 4 years of experience in React,
                  FastAPI, and cloud infrastructure. Currently using InterviewAI
                  to sharpen interview skills and optimise my resume for senior
                  engineering positions.
                </Typography>
                <Button variant="text">Show more</Button>
              </div>
            </div>

            {/* ── Activity cards ── */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 pb-10">
              <div className="rounded-xl border border-blue-gray-100 p-6 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-gray-900">
                    <DocumentTextIcon className="h-5 w-5 text-white" />
                  </div>
                  <Typography variant="h6" color="blue-gray">
                    Latest Resume
                  </Typography>
                </div>
                <Typography className="font-normal text-blue-gray-500 text-sm">
                  SoftwareEngineer_Resume_v3.pdf
                </Typography>
                <Typography className="font-normal text-blue-gray-400 text-xs">
                  Uploaded 2 days ago
                </Typography>
                <Button variant="outlined" size="sm" className="mt-auto w-fit">
                  View Dashboard
                </Button>
              </div>

              <div className="rounded-xl border border-blue-gray-100 p-6 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-gray-900">
                    <ChartBarIcon className="h-5 w-5 text-white" />
                  </div>
                  <Typography variant="h6" color="blue-gray">
                    Last Analysis
                  </Typography>
                </div>
                <Typography className="font-normal text-blue-gray-500 text-sm">
                  ATS Score: <span className="font-semibold text-blue-gray-800">84%</span> · 3 missing skills
                </Typography>
                <Typography className="font-normal text-blue-gray-400 text-xs">
                  Role: Senior Frontend Engineer @ Acme Corp
                </Typography>
                <Button variant="outlined" size="sm" className="mt-auto w-fit">
                  View Analysis
                </Button>
              </div>

              <div className="rounded-xl border border-blue-gray-100 p-6 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-gray-900">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
                  </div>
                  <Typography variant="h6" color="blue-gray">
                    Mock Interviews
                  </Typography>
                </div>
                <Typography className="font-normal text-blue-gray-500 text-sm">
                  8 sessions completed · 47 questions practised
                </Typography>
                <Typography className="font-normal text-blue-gray-400 text-xs">
                  Last session: yesterday
                </Typography>
                <Button variant="outlined" size="sm" className="mt-auto w-fit">
                  Start Interview
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="bg-white">
        <Footer />
      </div>
    </>
  );
}

export default Profile;