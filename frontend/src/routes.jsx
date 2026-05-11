import { Home, Profile, SignIn, SignUp , Dashboard, Analysis } from "@/pages";

export const routes = [
  {
    name: "home",
    path: "/home",
    element: <Home />,
    protected: false,
  },
  {
    name: "profile",
    path: "/profile",
    element: <Profile />,
    protected: true,
  },
  {
    name: "Sign In",
    path: "/sign-in",
    element: <SignIn />,
    protected: false,
  },
  {
    name: "Sign Up",
    path: "/sign-up",
    element: <SignUp />,
    protected: false,
  },
  {
    name: "Dashboard",
    path: "/dashboard",
    element: <Dashboard />,
    protected: true,
  },
  {
    name: "Analysis",
    path: "/analysis/:analysisId",
    element: <Analysis />,
    protected: true,
  },
];

export default routes;
