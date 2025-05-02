import { FormCheck, FormInput, FormLabel } from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import Alert from "@/components/Base/Alert";
import Lucide from "@/components/Base/Lucide";
import clsx from "clsx";
import _ from "lodash";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validators } from "@/utils/validators";
import { authentification } from "@/services/auth";
import LoadingIcon from "@/components/Base/LoadingIcon";
import { API_URL } from "@/constants";

interface FormState {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

function Main() {
  const nav = useNavigate();
  const { login } = authentification();
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormState>({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    setErrorMessage(""); // Clear error message on input change
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validators.validateForm(formData, {
      email: [validators.required, validators.email],
      password: [validators.required, validators.minLength(8)],
    });

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(""); // Clear previous errors
      await login(formData.email, formData.password);
      nav("/emploi-du-temps");
    } catch (error) {
      setErrorMessage("Échec de la connexion. Vérifiez vos identifiants.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = API_URL + "/api/auth/google/redirect";
  };

  const handleGithubLogin = () => {
    window.location.href = API_URL + "/api/auth/github/redirect";
  };

  const handleFacebookLogin = () => {
    alert("Pas encore implémenté");
  };

  return (
    <>
      <div className="container grid lg:h-screen grid-cols-12 lg:max-w-[1550px] 2xl:max-w-[1750px] py-10 px-5 sm:py-14 sm:px-10 md:px-36 lg:py-0 lg:pl-14 lg:pr-12 xl:px-24">
        <div
          className={clsx([
            "relative z-50 h-full col-span-12 p-7 sm:p-14 bg-white rounded-2xl lg:bg-transparent lg:pr-10 lg:col-span-5 xl:pr-24 2xl:col-span-4 lg:p-0 dark:bg-darkmode-600",
            "before:content-[''] before:absolute before:inset-0 before:-mb-3.5 before:bg-white/40 before:rounded-2xl before:mx-5 dark:before:hidden",
          ])}
        >
          <div className="relative z-10 flex flex-col justify-center w-full h-full py-2 lg:py-32">
            <div className="mt-10">
              <div className="text-2xl font-medium">Connexion</div>
              <div className="mt-2.5 text-slate-600 dark:text-slate-400">
                Pas de compte?{" "}
                <Link className="font-medium text-primary" to="/register">
                  S'inscrire
                </Link>
              </div>
              <Alert
                variant="outline-primary"
                className="flex items-center px-4 py-3 my-7 bg-primary/5 border-primary/20 rounded-[0.6rem] leading-[1.7]"
              >
                {({ dismiss }) => (
                  <>
                    <div className="">
                      <Lucide
                        icon="Lightbulb"
                        className="stroke-[0.8] w-7 h-7 mr-2 fill-primary/10"
                      />
                    </div>
                    <div className="ml-1 mr-8">
                      Bienvenue sur notre{" "}
                      <span className="font-medium">Plateforme</span> ! Cliquez
                      simplement sur{" "}
                      <span className="font-medium">Se connecter</span>
                    </div>
                    <Alert.DismissButton
                      type="button"
                      className="btn-close text-primary"
                      onClick={dismiss}
                      aria-label="Fermer"
                    >
                      <Lucide icon="X" className="w-5 h-5" />
                    </Alert.DismissButton>
                  </>
                )}
              </Alert>
              {errorMessage && (
                <Alert
                  variant="outline-danger"
                  className="flex items-center px-4 py-3 mb-6 bg-danger/5 border-danger/20 rounded-[0.6rem]"
                >
                  {({ dismiss }) => (
                    <>
                      <Lucide
                        icon="AlertCircle"
                        className="stroke-[0.8] w-6 h-6 mr-2 fill-danger/10"
                      />
                      <div className="ml-1 mr-8">{errorMessage}</div>
                      <Alert.DismissButton
                        type="button"
                        className="btn-close text-danger"
                        onClick={dismiss}
                        aria-label="Fermer"
                      >
                        <Lucide icon="X" className="w-5 h-5" />
                      </Alert.DismissButton>
                    </>
                  )}
                </Alert>
              )}
              <form className="mt-6" onSubmit={handleSubmit}>
                <div className="mb-5">
                  <FormLabel>Email*</FormLabel>
                  <FormInput
                    type="text"
                    name="email"
                    className={`block px-4 py-3.5 rounded-[0.6rem] border-slate-300/80 ${
                      formErrors.email ? "border-red-500" : ""
                    }`}
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.email}
                    </p>
                  )}
                </div>
                <div className="mb-5">
                  <FormLabel className="mt-4">Mot de passe*</FormLabel>
                  <FormInput
                    type="password"
                    name="password"
                    className={`block px-4 py-3.5 rounded-[0.6rem] border-slate-300/80 ${
                      formErrors.password ? "border-red-500" : ""
                    }`}
                    placeholder="************"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.password}
                    </p>
                  )}
                </div>
                <div className="mt-5 text-center xl:mt-8 xl:text-left space-y-4">
                  <Button
                    variant="primary"
                    rounded
                    className={`bg-gradient-to-r from-theme-1/70 to-theme-2/70 w-full py-3.5 xl:mr-3 dark:border-darkmode-400 ${
                      loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    disabled={loading}
                  >
                    {loading ? (
                      <LoadingIcon
                        icon="tail-spin"
                        className="w-8 h-8 mx-auto"
                        color="white"
                      />
                    ) : (
                      "Se connecter"
                    )}
                  </Button>
                  <div className="text-slate-600 dark:text-slate-400 text-sm mt-6">
                    Ou connectez-vous avec
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleGoogleLogin}
                      className="flex items-center justify-center w-full sm:w-1/3 py-2 border border-slate-300/80 rounded-[0.6rem] hover:bg-slate-50 dark:border-darkmode-400 dark:hover:bg-darkmode-500"
                    >
                      <Lucide icon="Chrome" className="w-5 h-5 mr-2" />
                      Google
                    </Button>
                    <Button
                      onClick={handleGithubLogin}
                      className="flex items-center justify-center w-full sm:w-1/3 py-2 border border-slate-300/80 rounded-[0.6rem] hover:bg-slate-50 dark:border-darkmode-400 dark:hover:bg-darkmode-500"
                    >
                      <Lucide icon="Github" className="w-5 h-5 mr-2" />
                      GitHub
                    </Button>
                    {/* <Button
                      onClick={handleFacebookLogin}
                      className="flex items-center justify-center w-full sm:w-1/3 py-2 border border-slate-300/80 rounded-[0.6rem] hover:bg-slate-50 dark:border-darkmode-400 dark:hover:bg-darkmode-500"
                    >
                      <Lucide icon="Facebook" className="w-5 h-5 mr-2" />
                      Facebook
                    </Button> */}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed container grid w-screen inset-0 h-screen grid-cols-12 lg:max-w-[1550px] 2xl:max-w-[1750px] pl-14 pr-12 xl:px-24">
        <div
          className={clsx([
            "relative h-screen col-span-12 lg:col-span-5 2xl:col-span-4 z-20",
            "after:bg-white after:hidden after:lg:block after:content-[''] after:absolute after:right-0 after:inset-y-0 after:bg-gradient-to-b after:from-white after:to-slate-100/80 after:w-[800%] after:rounded-[0_1.2rem_1.2rem_0/0_1.7rem_1.7rem_0] dark:after:bg-darkmode-600 dark:after:from-darkmode-600 dark:after:to-darkmode-600",
            "before:content-[''] before:hidden before:lg:block before:absolute before:right-0 before:inset-y-0 before:my-6 before:bg-gradient-to-b before:from-white/10 before:to-slate-50/10 before:bg-white/50 before:w-[800%] before:-mr-4 before:rounded-[0_1.2rem_1.2rem_0/0_1.7rem_1.7rem_0] dark:before:from-darkmode-300 dark:before:to-darkmode-300",
          ])}
        ></div>
        <div
          className={clsx([
            "h-full col-span-7 2xl:col-span-8 lg:relative",
            "before:content-[''] before:absolute before:lg:-ml-10 before:left-0 before:inset-y-0 before:bg-gradient-to-b before:from-theme-1 before:to-theme-2 before:w-screen before:lg:w-[800%]",
            "after:content-[''] after:absolute after:inset-y-0 after:left-0 after:w-screen after:lg:w-[800%] after:bg-texture-white after:bg-fixed after:bg-center after:lg:bg-[25rem_-25rem] after:bg-no-repeat",
          ])}
        >
          <div className="sticky top-0 z-10 flex-col justify-center hidden h-screen ml-16 lg:flex xl:ml-28 2xl:ml-36">
            <div className="leading-[1.4] text-[2.6rem] xl:text-5xl font-medium xl:leading-[1.2] text-white">
              Optimisez la Gestion <br /> de l'emploi du temps
            </div>
            <div className="mt-5 text-base leading-relaxed xl:text-lg text-white/70">
              Simplifiez la gestion de vos emplois de temps avec notre solution
              intuitive et efficace. Organisez, suivez et centralisez toutes vos
              interactions en un seul endroit pour une productivité optimale.
            </div>
          </div>
        </div>
      </div>
      <ThemeSwitcher />
    </>
  );
}

export default Main;
