import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Wizard,
  WizardStep,
  WizardNavigation,
  WizardProgress,
} from '@/components/ui/wizard';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  UserPlus,
  User,
  Scale,
  Target,
  Utensils,
  FileText,
  CheckCircle,
  Copy,
  Calendar,
} from 'lucide-react';

// Validation schemas for each step
const personalInfoSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  age: z.string().min(1, 'La edad es requerida')
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 1 && num <= 120;
    }, 'Edad debe estar entre 1 y 120 años'),
});

const physicalDataSchema = z.object({
  height: z.string().min(1, 'La estatura es requerida')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 50 && num <= 250;
    }, 'Estatura debe estar entre 50 y 250 cm'),
  initialWeight: z.string().min(1, 'El peso inicial es requerido')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 10 && num <= 500;
    }, 'Peso inicial debe estar entre 10 y 500 kg'),
});

const targetDataSchema = z.object({
  targetWeight: z.string().min(1, 'El peso objetivo es requerido')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 10 && num <= 500;
    }, 'Peso objetivo debe estar entre 10 y 500 kg'),
  dietLevel: z.string().min(1, 'El nivel de dieta es requerido'),
});

const medicalNotesSchema = z.object({
  medicalNotes: z.string().optional(),
});

interface PatientOnboardingWizardProps {
  onComplete: (patient: any, accessCode: string) => void;
  onCancel: () => void;
}

export function PatientOnboardingWizard({
  onComplete,
  onCancel,
}: PatientOnboardingWizardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [wizardData, setWizardData] = useState({
    personalInfo: { name: '', age: '' },
    physicalData: { height: '', initialWeight: '' },
    targetData: { targetWeight: '', dietLevel: '' },
    medicalNotes: { medicalNotes: '' },
  });
  const [createdPatient, setCreatedPatient] = useState<any>(null);
  const [accessCode, setAccessCode] = useState<string>('');

  // Forms for each step
  const personalInfoForm = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: wizardData.personalInfo,
  });

  const physicalDataForm = useForm({
    resolver: zodResolver(physicalDataSchema),
    defaultValues: wizardData.physicalData,
  });

  const targetDataForm = useForm({
    resolver: zodResolver(targetDataSchema),
    defaultValues: wizardData.targetData,
  });

  const medicalNotesForm = useForm({
    resolver: zodResolver(medicalNotesSchema),
    defaultValues: wizardData.medicalNotes,
  });

  // Patient creation mutation
  const createPatientMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/professional/patients', {
        name: data.name,
        age: parseInt(data.age),
        height: parseFloat(data.height),
        initialWeight: parseFloat(data.initialWeight),
        targetWeight: parseFloat(data.targetWeight),
        dietLevel: parseInt(data.dietLevel),
        medicalNotes: data.medicalNotes || null,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCreatedPatient(data.patient);
      setAccessCode(data.accessCode);
      queryClient.invalidateQueries({ queryKey: ['/api/professional/patients'] });
      toast({
        title: 'Paciente Creado Exitosamente',
        description: `${data.patient.name} ha sido registrado con código: ${data.accessCode}`,
        duration: 5000,
      });
    },
    onError: (error: any) => {
      console.error('Patient creation error:', error);
      toast({
        title: 'Error al Crear Paciente',
        description: error.message || 'Error al crear el paciente',
        variant: 'destructive',
      });
    },
  });

  const handleStepValidation = async (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        const personalValid = await personalInfoForm.trigger();
        if (personalValid) {
          setWizardData((prev) => ({
            ...prev,
            personalInfo: personalInfoForm.getValues(),
          }));
        }
        return personalValid;
      case 1:
        const physicalValid = await physicalDataForm.trigger();
        if (physicalValid) {
          setWizardData((prev) => ({
            ...prev,
            physicalData: physicalDataForm.getValues(),
          }));
        }
        return physicalValid;
      case 2:
        const targetValid = await targetDataForm.trigger();
        if (targetValid) {
          setWizardData((prev) => ({
            ...prev,
            targetData: targetDataForm.getValues(),
          }));
        }
        return targetValid;
      case 3:
        setWizardData((prev) => ({
          ...prev,
          medicalNotes: medicalNotesForm.getValues(),
        }));
        return true;
      default:
        return true;
    }
  };

  const handleFinish = () => {
    const finalData = {
      ...wizardData.personalInfo,
      ...wizardData.physicalData,
      ...wizardData.targetData,
      ...wizardData.medicalNotes,
    };
    createPatientMutation.mutate(finalData);
  };

  const copyAccessCode = async () => {
    if (accessCode) {
      await navigator.clipboard.writeText(accessCode);
      toast({
        title: 'Código Copiado',
        description: 'El código de acceso ha sido copiado al portapapeles',
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
          <UserPlus className="text-green-600" size={28} />
          <span>Asistente de Registro de Paciente</span>
        </h2>
        <p className="text-gray-600">
          Complete la información paso a paso para registrar un nuevo paciente
        </p>
      </div>

      <Wizard>
        {/* Step 1: Personal Information */}
        <WizardStep
          title="Información Personal"
          description="Datos básicos del paciente"
        >
          <WizardProgress />
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="text-blue-600" size={32} />
            </div>
          </div>

          <Form {...personalInfoForm}>
            <div className="space-y-4">
              <FormField
                control={personalInfoForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: María García López"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={personalInfoForm.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Edad *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ej: 35"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>

          <WizardNavigation
            onNext={async () => {
              const isValid = await handleStepValidation(0);
              if (isValid) {
                // Continue to next step
              }
            }}
            canProceed={personalInfoForm.formState.isValid}
          />
        </WizardStep>

        {/* Step 2: Physical Data */}
        <WizardStep
          title="Datos Físicos"
          description="Estatura y peso actual del paciente"
        >
          <WizardProgress />
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <Scale className="text-purple-600" size={32} />
            </div>
          </div>

          <Form {...physicalDataForm}>
            <div className="space-y-4">
              <FormField
                control={physicalDataForm.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estatura (cm) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Ej: 165.5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={physicalDataForm.control}
                name="initialWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso Inicial (kg) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Ej: 75.5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>

          <WizardNavigation
            onNext={async () => {
              const isValid = await handleStepValidation(1);
              if (isValid) {
                // Continue to next step
              }
            }}
            canProceed={physicalDataForm.formState.isValid}
          />
        </WizardStep>

        {/* Step 3: Target Data */}
        <WizardStep
          title="Objetivos"
          description="Peso objetivo y nivel de dieta asignado"
        >
          <WizardProgress />
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Target className="text-green-600" size={32} />
            </div>
          </div>

          <Form {...targetDataForm}>
            <div className="space-y-4">
              <FormField
                control={targetDataForm.control}
                name="targetWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso Objetivo (kg) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Ej: 65.0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={targetDataForm.control}
                name="dietLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel de Dieta *</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Seleccionar nivel de dieta...</option>
                        <option value="1">Nivel 1 - Dieta Básica</option>
                        <option value="2">Nivel 2 - Dieta Intermedia</option>
                        <option value="3">Nivel 3 - Dieta Avanzada</option>
                        <option value="4">Nivel 4 - Dieta Restrictiva</option>
                        <option value="5">Nivel 5 - Dieta Muy Restrictiva</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>

          <WizardNavigation
            onNext={async () => {
              const isValid = await handleStepValidation(2);
              if (isValid) {
                // Continue to next step
              }
            }}
            canProceed={targetDataForm.formState.isValid}
          />
        </WizardStep>

        {/* Step 4: Medical Notes */}
        <WizardStep
          title="Notas Médicas"
          description="Información médica adicional (opcional)"
        >
          <WizardProgress />
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <FileText className="text-orange-600" size={32} />
            </div>
          </div>

          <Form {...medicalNotesForm}>
            <FormField
              control={medicalNotesForm.control}
              name="medicalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Médicas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observaciones médicas, alergias, condiciones especiales..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>

          <WizardNavigation
            onFinish={handleFinish}
            finishLabel={createPatientMutation.isPending ? 'Creando...' : 'Crear Paciente'}
            canProceed={!createPatientMutation.isPending}
          />
        </WizardStep>

        {/* Step 5: Success */}
        {createdPatient && (
          <WizardStep
            title="¡Paciente Creado Exitosamente!"
            description="El paciente ha sido registrado y su código de acceso ha sido generado"
          >
            <WizardProgress />
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={40} />
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4">
                  Paciente: {createdPatient.name}
                </h3>
                
                <div className="bg-white border-2 border-green-300 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Código de Acceso</p>
                      <p className="text-2xl font-bold text-green-800 font-mono">
                        {accessCode}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyAccessCode}
                      className="flex items-center space-x-2"
                    >
                      <Copy size={16} />
                      <span>Copiar</span>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Calendar className="text-blue-600" size={16} />
                      <span className="font-medium text-blue-800">Válido hasta</span>
                    </div>
                    <p className="text-blue-700">
                      {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Utensils className="text-purple-600" size={16} />
                      <span className="font-medium text-purple-800">Nivel de Dieta</span>
                    </div>
                    <p className="text-purple-700">
                      Nivel {createdPatient.dietLevel}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={onCancel}>
                  Cerrar
                </Button>
                <Button 
                  onClick={() => onComplete(createdPatient, accessCode)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Ver Paciente
                </Button>
              </div>
            </div>
          </WizardStep>
        )}
      </Wizard>
    </div>
  );
}