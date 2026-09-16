import LoginForm from "./LoginForm";

type Search = Record<string, string | string[] | undefined>;

export default async function LoginPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const requestedNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const next = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/dashboard";
  const googleError = (Array.isArray(params.error) ? params.error[0] : params.error) ?? "";
  return <LoginForm key={`${next}:${googleError}`} next={next} googleError={googleError} />;
}
