"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Card, CardBody, Input, Checkbox } from "@heroui/react";
import { Clock, AlertCircle } from "lucide-react";
import { FormValues } from "../schema";

interface ExamSettingsProps {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
}

export function ExamSettings({ register, errors }: ExamSettingsProps) {
  return (
    <div className="sticky top-24 space-y-4">
      <Card className="border border-default-200 shadow-sm">
        <CardBody className="p-5 space-y-6">
          <h3 className="font-semibold text-default-600 flex items-center gap-2">
            <Clock size={18} />
            Settings
          </h3>

          <div className="space-y-4">
            <Input
              {...register("duration", { valueAsNumber: true })}
              type="number"
              label="Duration"
              variant="bordered"
              labelPlacement="outside"
              placeholder="30"
              errorMessage={errors.duration?.message}
              classNames={{
                input: "no-arrow",
              }}
              isInvalid={!!errors.duration}
              endContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">min</span>
                </div>
              }
            />

            <div className="flex flex-col gap-3">
              <Checkbox
                size="sm"
                defaultSelected
                classNames={{ label: "text-small text-default-600" }}
              >
                Shuffle Questions
              </Checkbox>
              <Checkbox
                size="sm"
                classNames={{ label: "text-small text-default-600" }}
              >
                Show Results Immediately
              </Checkbox>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-primary-50/50 border-none shadow-none">
        <CardBody className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-white rounded-md shadow-sm text-primary">
              <AlertCircle size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Pro Tip</p>
              <p className="text-xs text-default-500 mt-1 leading-relaxed">
                Mix question types to test different skills. Short answers are
                great for critical thinking.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
