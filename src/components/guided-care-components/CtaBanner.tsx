import { PrimaryButton } from "../PrimaryButton";

export function CtaBanner() {
  return (
    <div className="guidedProgramDetail__ctaBanner">
      <h2 className="guidedProgramDetail__ctaBannerTitle">
        Discover the program that truly speaks to your life and needs.
      </h2>
      <PrimaryButton label="Select your plan" to="/all-guided-programs" />
    </div>
  );
}
