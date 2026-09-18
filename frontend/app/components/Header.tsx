import { MutedText, PageTitle } from "./atoms";

export function Header() {
  return (
    <header>
      <PageTitle>Brand Mentions</PageTitle>
      <MutedText className="mt-1">Track how often your brand appears across AI model responses.</MutedText>
    </header>
  );
}
