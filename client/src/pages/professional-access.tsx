import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Stethoscope } from "lucide-react";

export default function ProfessionalAccess() {
  const [accessCode, setAccessCode] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const validateCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      console.log("Validating professional code:", code);
      const response = await fetch("/api/professional/validate", {
        method: "POST",
        body: JSON.stringify({ accessCode: code }),
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error de validación");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Professional validation successful:", data);
      toast({
        title: "Código validado",
        description: `Bienvenido, ${data.professional.name}`,
      });
      // Store professional info in localStorage for the session
      localStorage.setItem('professionalInfo', JSON.stringify(data.professional));
      setLocation("/professional");
    },
    onError: (error) => {
      console.error("Professional validation error:", error);
      toast({
        title: "Error",
        description: error.message || "Código profesional no válido",
        variant: "destructive",
      });
    },
  });

  const handleValidate = () => {
    if (!accessCode.trim()) {
      toast({
        title: "Error",
        description: "Ingrese un código de acceso",
        variant: "destructive",
      });
      return;
    }
    validateCodeMutation.mutate(accessCode.trim());
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Stethoscope className="text-medical-blue" size={24} />
            Panel Profesional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accessCode">Código de Acceso Profesional</Label>
              <Input
                id="accessCode"
                placeholder="Ingrese su código profesional"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleValidate();
                  }
                }}
              />
            </div>
            <Button 
              onClick={handleValidate}
              className="w-full"
              disabled={validateCodeMutation.isPending}
            >
              {validateCodeMutation.isPending ? "Validando..." : "Validar Código"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}