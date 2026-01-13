"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldSeparator,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  createCreateOrderSchema,
  type CreateOrderValues,
  ORDER_STATUSES,
  TEMP_SENSITIVE,
} from "./validation-schema";
import { cn } from "@/lib/utils";

type Props = {
  onCreated: () => void;
};

type TabKey =
  | "record"
  | "vehicle"
  | "payer"
  | "transport"
  | "attachments"
  | "notes";

const TAB_FIELDS: Record<TabKey, (keyof CreateOrderValues)[]> = {
  record: ["ztNumber", "pwNumber", "status"],
  vehicle: [
    "truckPlate",
    "trailerPlate",
    "driverFirstName",
    "driverLastName",
    "driverPhone",
  ],
  payer: ["principal", "contractNumber", "payerName", "payerNip", "payerEmail"],
  transport: [
    "fromCountry",
    "toCountry",
    "weightKg",
    "loadingDate",
    "cargoDescription",
    "tempSensitive",
  ],
  attachments: ["attachments"],
  notes: ["notes"],
};

export default function CreateOrderForm({ onCreated }: Props) {
  const t = useTranslations("CreateOrderDialog");
  const [activeTab, setActiveTab] = useState<TabKey>("record");
  const [showTabErrors, setShowTabErrors] = useState(false);

  const schema = useMemo(() => {
    return createCreateOrderSchema({
      required: t("validation.required"),
      emailInvalid: t("validation.emailInvalid"),
      phoneInvalid: t("validation.phoneInvalid"),
      weightInvalid: t("validation.weightInvalid"),
      dateInvalid: t("validation.dateInvalid"),
      invalidOption: t("validation.invalidOption"),
    });
  }, [t]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<CreateOrderValues>({
    mode: "onSubmit",
    resolver: zodResolver(schema) as Resolver<CreateOrderValues>,
    defaultValues: {
      ztNumber: "",
      pwNumber: "",
      status: undefined as "on_time" | "issue" | "in_progress" | undefined,
      truckPlate: "",
      trailerPlate: "",
      driverFirstName: "",
      driverLastName: "",
      driverPhone: "",
      principal: "",
      contractNumber: "",
      payerName: "",
      payerNip: "",
      payerEmail: "",
      fromCountry: "PL",
      toCountry: "PL",
      weightKg: "" as unknown as number,
      loadingDate: "",
      cargoDescription: "",
      tempSensitive: undefined as "yes" | "no" | undefined,
      notes: "",
      attachments: null,
    },
  });

  const attachments = watch("attachments");

  const tabHasError = (tab: TabKey) => {
    const fields = TAB_FIELDS[tab];
    return fields.some((f) => Boolean((errors as Record<string, unknown>)[f]));
  };

  const onValid = async (values: CreateOrderValues) => {
    setShowTabErrors(false);

    // TODO: tutaj podłączysz service / action do backendu
    console.log("CREATE ORDER", values);

    reset();
    onCreated();
  };

  const onInvalid = () => {
    // UX: nie przerzucamy tabów, tylko pokazujemy ikonki błędów na tabach
    setShowTabErrors(true);
  };

  const tabTriggerClass =
    "data-[state=active]:bg-[#F2542F] data-[state=active]:text-white";

  return (
    <form noValidate onSubmit={handleSubmit(onValid, onInvalid)}>
      <FieldSet>
        <FieldGroup>
          <FieldSeparator />

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabKey)}
            className="w-full"
          >
            <TabsList className="h-auto w-full justify-start gap-1 rounded-xl bg-muted/50 p-1 overflow-x-auto">
              <TabLabel
                value="record"
                className={tabTriggerClass}
                label={t("tabs.record")}
                showError={showTabErrors && tabHasError("record")}
              />
              <TabLabel
                value="vehicle"
                className={tabTriggerClass}
                label={t("tabs.vehicle")}
                showError={showTabErrors && tabHasError("vehicle")}
              />
              <TabLabel
                value="payer"
                className={tabTriggerClass}
                label={t("tabs.payer")}
                showError={showTabErrors && tabHasError("payer")}
              />
              <TabLabel
                value="transport"
                className={tabTriggerClass}
                label={t("tabs.transport")}
                showError={showTabErrors && tabHasError("transport")}
              />
              <TabLabel
                value="attachments"
                className={tabTriggerClass}
                label={t("tabs.attachments")}
                showError={showTabErrors && tabHasError("attachments")}
              />
              <TabLabel
                value="notes"
                className={tabTriggerClass}
                label={t("tabs.notes")}
                showError={showTabErrors && tabHasError("notes")}
              />
            </TabsList>

            {/* Ewidencja */}
            <TabsContent value="record" className="mt-6">
              <FieldGroup className="gap-6">
                <Field data-invalid={!!errors.ztNumber}>
                  <FieldLabel htmlFor="ztNumber" required>
                    {t("fields.ztNumber")}
                  </FieldLabel>
                  <Input
                    id="ztNumber"
                    placeholder={t("placeholders.ztNumber")}
                    aria-invalid={!!errors.ztNumber}
                    {...register("ztNumber")}
                  />
                  {errors.ztNumber?.message && (
                    <FieldError>{errors.ztNumber.message}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.pwNumber}>
                  <FieldLabel htmlFor="pwNumber" required>
                    {t("fields.pwNumber")}
                  </FieldLabel>
                  <Input
                    id="pwNumber"
                    placeholder={t("placeholders.pwNumber")}
                    aria-invalid={!!errors.pwNumber}
                    {...register("pwNumber")}
                  />
                  {errors.pwNumber?.message && (
                    <FieldError>{errors.pwNumber.message}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.status}>
                  <FieldLabel required>{t("fields.status")}</FieldLabel>

                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger aria-invalid={!!errors.status}>
                          <SelectValue placeholder={t("placeholders.status")} />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {t(`options.status.${s}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />

                  {errors.status?.message && (
                    <FieldError>{errors.status.message}</FieldError>
                  )}
                </Field>
              </FieldGroup>
            </TabsContent>

            {/* Pojazd */}
            <TabsContent value="vehicle" className="mt-6">
              <FieldGroup className="gap-6">
                <Field data-invalid={!!errors.truckPlate}>
                  <FieldLabel htmlFor="truckPlate" required>
                    {t("fields.truckPlate")}
                  </FieldLabel>
                  <Input
                    id="truckPlate"
                    placeholder={t("placeholders.truckPlate")}
                    aria-invalid={!!errors.truckPlate}
                    {...register("truckPlate")}
                  />
                  {errors.truckPlate?.message && (
                    <FieldError>{errors.truckPlate.message}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.trailerPlate}>
                  <FieldLabel htmlFor="trailerPlate" required>
                    {t("fields.trailerPlate")}
                  </FieldLabel>
                  <Input
                    id="trailerPlate"
                    placeholder={t("placeholders.trailerPlate")}
                    aria-invalid={!!errors.trailerPlate}
                    {...register("trailerPlate")}
                  />
                  {errors.trailerPlate?.message && (
                    <FieldError>{errors.trailerPlate.message}</FieldError>
                  )}
                </Field>

                <FieldSeparator />

                <FieldGroup className="gap-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field data-invalid={!!errors.driverFirstName}>
                      <FieldLabel htmlFor="driverFirstName" required>
                        {t("fields.driverFirstName")}
                      </FieldLabel>
                      <Input
                        id="driverFirstName"
                        placeholder={t("placeholders.driverFirstName")}
                        aria-invalid={!!errors.driverFirstName}
                        {...register("driverFirstName")}
                      />
                      {errors.driverFirstName?.message && (
                        <FieldError>
                          {errors.driverFirstName.message}
                        </FieldError>
                      )}
                    </Field>

                    <Field data-invalid={!!errors.driverLastName}>
                      <FieldLabel htmlFor="driverLastName" required>
                        {t("fields.driverLastName")}
                      </FieldLabel>
                      <Input
                        id="driverLastName"
                        placeholder={t("placeholders.driverLastName")}
                        aria-invalid={!!errors.driverLastName}
                        {...register("driverLastName")}
                      />
                      {errors.driverLastName?.message && (
                        <FieldError>{errors.driverLastName.message}</FieldError>
                      )}
                    </Field>
                  </div>

                  <Field data-invalid={!!errors.driverPhone}>
                    <FieldLabel htmlFor="driverPhone" required>
                      {t("fields.driverPhone")}
                    </FieldLabel>
                    <Input
                      id="driverPhone"
                      placeholder={t("placeholders.driverPhone")}
                      aria-invalid={!!errors.driverPhone}
                      {...register("driverPhone")}
                    />
                    {errors.driverPhone?.message && (
                      <FieldError>{errors.driverPhone.message}</FieldError>
                    )}
                  </Field>
                </FieldGroup>
              </FieldGroup>
            </TabsContent>

            {/* Płatnik */}
            <TabsContent value="payer" className="mt-6">
              <FieldGroup className="gap-6">
                <Field data-invalid={!!errors.principal}>
                  <FieldLabel htmlFor="principal" required>
                    {t("fields.principal")}
                  </FieldLabel>
                  <Input
                    id="principal"
                    placeholder={t("placeholders.principal")}
                    aria-invalid={!!errors.principal}
                    {...register("principal")}
                  />
                  {errors.principal?.message && (
                    <FieldError>{errors.principal.message}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.contractNumber}>
                  <FieldLabel htmlFor="contractNumber" required>
                    {t("fields.contractNumber")}
                  </FieldLabel>
                  <Input
                    id="contractNumber"
                    placeholder={t("placeholders.contractNumber")}
                    aria-invalid={!!errors.contractNumber}
                    {...register("contractNumber")}
                  />
                  {errors.contractNumber?.message && (
                    <FieldError>{errors.contractNumber.message}</FieldError>
                  )}
                </Field>

                <FieldSeparator />

                <Field data-invalid={!!errors.payerName}>
                  <FieldLabel htmlFor="payerName" required>
                    {t("fields.payerName")}
                  </FieldLabel>
                  <Input
                    id="payerName"
                    placeholder={t("placeholders.payerName")}
                    aria-invalid={!!errors.payerName}
                    {...register("payerName")}
                  />
                  {errors.payerName?.message && (
                    <FieldError>{errors.payerName.message}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.payerNip}>
                  <FieldLabel htmlFor="payerNip" required>
                    {t("fields.payerNip")}
                  </FieldLabel>
                  <Input
                    id="payerNip"
                    placeholder={t("placeholders.payerNip")}
                    aria-invalid={!!errors.payerNip}
                    {...register("payerNip")}
                  />
                  {errors.payerNip?.message && (
                    <FieldError>{errors.payerNip.message}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.payerEmail}>
                  <FieldLabel htmlFor="payerEmail" required>
                    {t("fields.payerEmail")}
                  </FieldLabel>
                  <Input
                    id="payerEmail"
                    type="email"
                    placeholder={t("placeholders.payerEmail")}
                    aria-invalid={!!errors.payerEmail}
                    {...register("payerEmail")}
                  />
                  {errors.payerEmail?.message && (
                    <FieldError>{errors.payerEmail.message}</FieldError>
                  )}
                </Field>
              </FieldGroup>
            </TabsContent>

            {/* Transport */}
            <TabsContent value="transport" className="mt-6">
              <FieldGroup className="gap-6">
                <Field data-invalid={!!errors.fromCountry}>
                  <FieldLabel htmlFor="fromCountry" required>
                    {t("fields.fromCountry")}
                  </FieldLabel>
                  <Input
                    id="fromCountry"
                    placeholder={t("placeholders.fromCountry")}
                    aria-invalid={!!errors.fromCountry}
                    {...register("fromCountry")}
                  />
                  {errors.fromCountry?.message && (
                    <FieldError>{errors.fromCountry.message}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.toCountry}>
                  <FieldLabel htmlFor="toCountry" required>
                    {t("fields.toCountry")}
                  </FieldLabel>
                  <Input
                    id="toCountry"
                    placeholder={t("placeholders.toCountry")}
                    aria-invalid={!!errors.toCountry}
                    {...register("toCountry")}
                  />
                  {errors.toCountry?.message && (
                    <FieldError>{errors.toCountry.message}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.weightKg}>
                  <FieldLabel htmlFor="weightKg" required>
                    {t("fields.weightKg")}
                  </FieldLabel>
                  <Input
                    id="weightKg"
                    type="number"
                    inputMode="numeric"
                    placeholder={t("placeholders.weightKg")}
                    aria-invalid={!!errors.weightKg}
                    {...register("weightKg")}
                  />
                  {errors.weightKg?.message && (
                    <FieldError>{errors.weightKg.message}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.loadingDate}>
                  <FieldLabel htmlFor="loadingDate" required>
                    {t("fields.loadingDate")}
                  </FieldLabel>
                  <Input
                    id="loadingDate"
                    type="date"
                    aria-invalid={!!errors.loadingDate}
                    {...register("loadingDate")}
                  />
                  {errors.loadingDate?.message && (
                    <FieldError>{errors.loadingDate.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="cargoDescription">
                    {t("fields.cargoDescription")}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {t("optional")}
                    </span>
                  </FieldLabel>
                  <Textarea
                    id="cargoDescription"
                    placeholder={t("placeholders.cargoDescription")}
                    className="resize-none"
                    rows={4}
                    {...register("cargoDescription")}
                  />
                </Field>

                <Field data-invalid={!!errors.tempSensitive}>
                  <FieldLabel required>{t("fields.tempSensitive")}</FieldLabel>
                  <Controller
                    name="tempSensitive"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger aria-invalid={!!errors.tempSensitive}>
                          <SelectValue
                            placeholder={t("placeholders.tempSensitive")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {TEMP_SENSITIVE.map((v) => (
                            <SelectItem key={v} value={v}>
                              {t(`options.tempSensitive.${v}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.tempSensitive?.message && (
                    <FieldError>{errors.tempSensitive.message}</FieldError>
                  )}
                </Field>
              </FieldGroup>
            </TabsContent>

            {/* Załączniki */}
            <TabsContent value="attachments" className="mt-6">
              <FieldGroup className="gap-6">
                <Field>
                  <FieldLabel htmlFor="attachments">
                    {t("fields.attachments")}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {t("optional")}
                    </span>
                  </FieldLabel>
                  <Input
                    id="attachments"
                    type="file"
                    multiple
                    {...register("attachments")}
                  />
                  <FieldDescription>
                    {t("helpers.attachments")}
                  </FieldDescription>
                </Field>

                {attachments?.length ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {t("helpers.attachmentsList")}
                    </p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {Array.from(attachments).map((f) => (
                        <li key={f.name}>{f.name}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </FieldGroup>
            </TabsContent>

            {/* Uwagi */}
            <TabsContent value="notes" className="mt-6">
              <FieldGroup className="gap-6">
                <Field>
                  <FieldLabel htmlFor="notes">
                    {t("fields.notes")}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {t("optional")}
                    </span>
                  </FieldLabel>
                  <Textarea
                    id="notes"
                    placeholder={t("placeholders.notes")}
                    className="resize-none"
                    rows={6}
                    {...register("notes")}
                  />
                </Field>
              </FieldGroup>
            </TabsContent>
          </Tabs>

          <FieldSeparator />

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full rounded-xl py-6 text-base",
                "bg-[#F2542F] hover:bg-[#F2542F]/90"
              )}
            >
              {isSubmitting ? t("buttons.submitting") : t("buttons.submit")}
            </Button>
          </div>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}

function TabLabel({
  value,
  label,
  className,
  showError,
}: {
  value: string;
  label: string;
  className?: string;
  showError: boolean;
}) {
  return (
    <TabsTrigger
      value={value}
      className={cn("relative rounded-lg px-3 py-2", className)}
    >
      <span className="inline-flex items-center gap-2">
        {label}
        {showError ? (
          <AlertCircle className="h-4 w-4 text-destructive" />
        ) : null}
      </span>
    </TabsTrigger>
  );
}
