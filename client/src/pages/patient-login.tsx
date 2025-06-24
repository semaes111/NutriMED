import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Stethoscope, UserCheck, ArrowRight } from "lucide-react";

const accessCodeSchema = z.object({
  accessCode: z.string().min(1, "Código de acceso requerido"),
});

type AccessCodeForm = z.infer<typeof accessCodeSchema>;

export default function PatientLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<AccessCodeForm>({
    resolver: zodResolver(accessCodeSchema),
    defaultValues: {
      accessCode: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: AccessCodeForm) => {
      console.log("Validating patient access code:", data.accessCode);
      const response = await fetch("/api/patient/validate", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Código de acceso inválido");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Patient validation successful:", data);
      toast({
        title: "Acceso autorizado",
        description: `Bienvenido/a ${data.patient.name}`,
      });
      // Store patient session info
      localStorage.setItem('patientSession', JSON.stringify({
        patientId: data.patient.id,
        accessCode: data.patient.accessCode,
        loginTime: new Date().toISOString(),
        patient: data.patient
      }));
      setLocation("/dashboard");
    },
    onError: (error) => {
      console.error("Patient validation error:", error);
      toast({
        title: "Error de acceso",
        description: error.message || "Código de acceso inválido o expirado",
        variant: "destructive",
      });
      // Clear the form
      form.reset();
    },
  });

  const onSubmit = (data: AccessCodeForm) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-medical-blue p-3 rounded-full">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-medical-blue">Dr. Sergio Martínez</h1>
          <p className="text-gray-600">Medicina Intensiva y Nutrición</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-2">
              <UserCheck className="h-6 w-6 text-medical-green" />
            </div>
            <CardTitle className="text-xl text-medical-blue">Acceso del Paciente</CardTitle>
            <CardDescription className="text-sm">
              Ingrese su código de acceso temporal para ver su plan nutricional personalizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="accessCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Código de Acceso Temporal
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Y10UDRY5"
                          {...field}
                          className="text-center font-mono text-lg h-12 border-2 focus:border-medical-green uppercase"
                          maxLength={8}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Su código fue proporcionado por el consultorio médico
                      </p>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-medical-green hover:bg-green-700 h-12 text-base font-medium"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    "Validando acceso..."
                  ) : (
                    <>
                      Acceder a mi Plan
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 pt-4 border-t text-center">
              <p className="text-xs text-gray-500">
                ¿Es usted un profesional médico?{" "}
                <button
                  onClick={() => setLocation("/professional-access")}
                  className="text-medical-blue hover:underline font-medium"
                >
                  Panel Profesional
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>Sistema de Consulta Nutricional • Privado y Seguro</p>
          <p className="mt-1">Su código de acceso temporal fue proporcionado por el consultorio</p>
        </div>
      </div>
    </div>
  );
}