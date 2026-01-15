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
import { useCreateOrderMutation } from "../../hooks/use-create-order-mutation";
import { mapCreateOrderValuesToPayload } from "../../mappers/map-create-order-payload";
import { Spinner } from "@/components/ui/spinner";

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
  record: ["ztNumber", "pwNumber", "timelinessStatus"],
  vehicle: [
    "vehiclePlate",
    "trailerPlate",
    "driverFirstName",
    "driverLastName",
    "driverPhone",
  ],
  payer: [
    "clientName",
    "contractNumber",
    "payerName",
    "payerVatId",
    "payerEmail",
  ],
  transport: [
    "fromCountry",
    "toCountry",
    "cargoWeightKg",
    "loadingDate",
    "cargoDescription",
    "temperatureSensitive",
  ],
  attachments: ["attachments"],
  notes: ["notes"],
};

export default function CreateOrderForm({ onCreated }: Props) {
  const t = useTranslations("CreateOrderDialog");
  const [activeTab, setActiveTab] = useState<TabKey>("record");
  const [showTabErrors, setShowTabErrors] = useState(false);

  const createMut = useCreateOrderMutation();

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
      timelinessStatus: "",
      vehiclePlate: "",
      trailerPlate: "",
      driverFirstName: "",
      driverLastName: "",
      driverPhone: "",
      clientName: "",
      contractNumber: "",
      payerName: "",
      payerVatId: "",
      payerEmail: "",
      fromCountry: "PL",
      toCountry: "PL",
      cargoWeightKg: "" as unknown as number,
      loadingDate: "",
      cargoDescription: "",
      temperatureSensitive: undefined as "yes" | "no" | undefined,
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

    try {
      const payload = mapCreateOrderValuesToPayload(values);
      await createMut.mutateAsync(payload);

      reset();
      onCreated();
    } catch (e) {
      console.log(e);
    }
  };

  const onInvalid = () => {
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
            <TabsList className="h-auto w-full justify-start gap-1 rounded-xl p-1 overflow-x-auto">
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

                <Field data-invalid={!!errors.timelinessStatus}>
                  <FieldLabel>{t("fields.timelinessStatus")}</FieldLabel>

                  <Controller
                    name="timelinessStatus"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger aria-invalid={!!errors.timelinessStatus}>
                          <SelectValue
                            placeholder={t("placeholders.timelinessStatus")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {t(`options.timelinessStatus.${s}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />

                  {errors.timelinessStatus?.message && (
                    <FieldError>{errors.timelinessStatus.message}</FieldError>
                  )}
                </Field>
              </FieldGroup>
            </TabsContent>

            {/* Pojazd */}
            <TabsContent value="vehicle" className="mt-6">
              <FieldGroup className="gap-6">
                <Field data-invalid={!!errors.vehiclePlate}>
                  <FieldLabel htmlFor="vehiclePlate" required>
                    {t("fields.vehiclePlate")}
                  </FieldLabel>
                  <Input
                    id="vehiclePlate"
                    placeholder={t("placeholders.vehiclePlate")}
                    aria-invalid={!!errors.vehiclePlate}
                    {...register("vehiclePlate")}
                  />
                  {errors.vehiclePlate?.message && (
                    <FieldError>{errors.vehiclePlate.message}</FieldError>
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
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">
                    {t("fields.driver")}
                  </span>
                  <FieldGroup className="gap-4 border border-[#EBE5D4]/60 p-4 rounded-md">
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
                          <FieldError>
                            {errors.driverLastName.message}
                          </FieldError>
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
                </div>
              </FieldGroup>
            </TabsContent>

            {/* Płatnik */}
            <TabsContent value="payer" className="mt-6">
              <FieldGroup className="gap-6">
                <Field data-invalid={!!errors.clientName}>
                  <FieldLabel htmlFor="clientName" required>
                    {t("fields.clientName")}
                  </FieldLabel>
                  <Input
                    id="clientName"
                    placeholder={t("placeholders.clientName")}
                    aria-invalid={!!errors.clientName}
                    {...register("clientName")}
                  />
                  {errors.clientName?.message && (
                    <FieldError>{errors.clientName.message}</FieldError>
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
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">
                    {t("fields.payer")}
                  </span>
                  <FieldGroup className="gap-4 border border-[#EBE5D4]/60 p-4 rounded-md">
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

                    <Field data-invalid={!!errors.payerVatId}>
                      <FieldLabel htmlFor="payerVatId" required>
                        {t("fields.payerVatId")}
                      </FieldLabel>
                      <Input
                        id="payerVatId"
                        placeholder={t("placeholders.payerVatId")}
                        aria-invalid={!!errors.payerVatId}
                        {...register("payerVatId")}
                      />
                      {errors.payerVatId?.message && (
                        <FieldError>{errors.payerVatId.message}</FieldError>
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
                </div>
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

                <Field data-invalid={!!errors.cargoWeightKg}>
                  <FieldLabel htmlFor="cargoWeightKg" required>
                    {t("fields.cargoWeightKg")}
                  </FieldLabel>
                  <Input
                    id="cargoWeightKg"
                    type="number"
                    inputMode="numeric"
                    placeholder={t("placeholders.cargoWeightKg")}
                    aria-invalid={!!errors.cargoWeightKg}
                    {...register("cargoWeightKg")}
                  />
                  {errors.cargoWeightKg?.message && (
                    <FieldError>{errors.cargoWeightKg.message}</FieldError>
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
                    <span className="mt-auto mb-0 text-xs text-muted-foreground">
                      ({t("optional")})
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

                <Field data-invalid={!!errors.temperatureSensitive}>
                  <FieldLabel required>
                    {t("fields.temperatureSensitive")}
                  </FieldLabel>
                  <Controller
                    name="temperatureSensitive"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          aria-invalid={!!errors.temperatureSensitive}
                        >
                          <SelectValue
                            placeholder={t("placeholders.temperatureSensitive")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {TEMP_SENSITIVE.map((v) => (
                            <SelectItem key={v} value={v}>
                              {t(`options.temperatureSensitive.${v}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.temperatureSensitive?.message && (
                    <FieldError>
                      {errors.temperatureSensitive.message}
                    </FieldError>
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
                    <span className="mt-auto mb-0 text-xs text-muted-foreground">
                      ({t("optional")})
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
                    <span className="mt-auto mb-0 text-xs text-muted-foreground">
                      ({t("optional")})
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
              {isSubmitting ? (
                <>
                  <Spinner />
                  {t("buttons.submitting")}
                </>
              ) : (
                t("buttons.submit")
              )}
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
