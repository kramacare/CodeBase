import SectionWrapper from "./SectionWrapper";
import RoleToggle from "./RoleToggle";
import type { UserRole } from "./RoleToggle";

interface RoleSelectSectionProps {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const RoleSelectSection = ({ role, onRoleChange }: RoleSelectSectionProps) => (
  <SectionWrapper id="role-select">
    <div className="text-center animate-fade-in">
      <h2 className="font-display text-3xl font-bold md:text-4xl">
        Choose Your <span className="text-primary">Experience</span>
      </h2>
      <p className="mt-3 text-muted-foreground">Select your role to see tailored features and next steps.</p>
      <div className="mt-8">
        <RoleToggle role={role} onChange={onRoleChange} />
      </div>
    </div>
  </SectionWrapper>
);

export default RoleSelectSection;
