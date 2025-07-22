import { useState } from "react";
import { AuditForm } from "@/components/AuditForm";
import { AppLayout } from "@/components/layout/AppLayout";

const Audit = () => {
  const [formData, setFormData] = useState({});

  return (
    <AppLayout>
      <AuditForm setFormData={setFormData} />
    </AppLayout>
  );
};

export default Audit;