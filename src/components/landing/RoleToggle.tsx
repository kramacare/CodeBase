export type UserRole = "patient" | "clinic";

interface RoleToggleProps {
  role: UserRole;
  onChange: (role: UserRole) => void;
}

const RoleToggle = ({ role, onChange }: RoleToggleProps) => (
  <div className="flex justify-center">
    <div className="inline-flex rounded-full border border-border bg-secondary/60 p-1 shadow-sm">
      {(["patient", "clinic"] as const).map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
            role === r
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {r === "patient" ? "For Patients" : "For Clinics"}
        </button>
      ))}
    </div>
  </div>
);

export default RoleToggle;
