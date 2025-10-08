import { OrganizationList } from "@clerk/nextjs";

export default function SelectOrganizationPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Select an Organization</h1>
          <p className="text-muted-foreground mt-2">Choose an organization to continue or create a new one</p>
        </div>
        <OrganizationList hidePersonal afterSelectOrganizationUrl="/" afterCreateOrganizationUrl="/" />
      </div>
    </div>
  );
}
