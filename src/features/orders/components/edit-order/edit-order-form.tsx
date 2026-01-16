"use client";

import { useEffect, useMemo, useState } from "react";
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

import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { useUpdateOrderMutation } from "../../hooks/use-update-order-mutation";
import {
  createEditOrderSchema,
  type EditOrderValues,
  ORDER_STATUSES,
  TEMP_SENSITIVE,
} from "./validation-schema";

// ⚠️ dopasuj typ do swojego DTO z query
import type { OrderDetailsDto } from "../../types";
import { mapUpdateOrderValuesToPayload } from "../../mappers/map-update-order-playload";

type Props = {
  orderId: string;
  initial: OrderDetailsDto; // dane z useOrderDetailsQuery
  onSaved: () => void;
};

type TabKey = "record" | "vehicle" | "payer" | "transport" | "notes";

const TAB_FIELDS: Record<TabKey, (keyof EditOrderValues)[]> = {
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
    "fromAddress",
    "toCountry",
    "toAddress",
    "cargoWeightKg",
    "loadingDate",
    "loadingTime",
    "cargoDescription",
    "temperatureSensitive",
  ],
  notes: ["notes"],
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toDateInputValue(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  // local date (bez przesunięć UTC)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export default function EditOrderForm({ orderId, initial, onSaved }: Props) {
  // możesz użyć osobnych translacji albo tych samych co Create
  const t = useTranslations("CreateOrderDialog");

  const [activeTab, setActiveTab] = useState<TabKey>("record");
  const [showTabErrors, setShowTabErrors] = useState(false);

  const updateMut = useUpdateOrderMutation();

  const schema = useMemo(() => {
    return createEditOrderSchema({
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
  } = useForm<EditOrderValues>({
    mode: "onSubmit",
    resolver: zodResolver(schema) as Resolver<EditOrderValues>,
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

      fromCountry: "",
      fromAddress: "",
      toCountry: "",
      toAddress: "",

      cargoWeightKg: "" as unknown as number,
      loadingDate: "",
      loadingTime: "",
      cargoDescription: "",
      temperatureSensitive: undefined as "yes" | "no" | undefined,

      notes: "",
    },
  });

  useEffect(() => {
    reset(
      {
        ztNumber: initial.ztNumber ?? "",
        pwNumber: initial.pwNumber ?? "",
        timelinessStatus:
          initial.timelinessStatus && initial.timelinessStatus.trim() !== ""
            ? initial.timelinessStatus
            : "",

        vehiclePlate: initial.vehiclePlate ?? "",
        trailerPlate: initial.trailerPlate ?? "",
        driverFirstName: initial.driverFirstName ?? "",
        driverLastName: initial.driverLastName ?? "",
        driverPhone: initial.driverPhone ?? "",

        clientName: initial.clientName ?? "",
        contractNumber: initial.contractNumber ?? "",
        payerName: initial.payerName ?? "",
        payerVatId: initial.payerVatId ?? "",
        payerEmail: initial.payerEmail ?? "",

        fromCountry: initial.fromCountry ?? "",
        fromAddress: initial.fromAddress ?? "",
        toCountry: initial.toCountry ?? "",
        toAddress: initial.toAddress ?? "",

        cargoWeightKg: (initial.cargoWeightKg ?? "") as unknown as number,
        loadingDate: toDateInputValue(initial.loadingDate),
        loadingTime: initial.loadingTime ?? "",
        cargoDescription: initial.cargoDescription ?? "",
        temperatureSensitive: initial.temperatureSensitive
          ? ("yes" as const)
          : ("no" as const),

        notes: initial.notes ?? "",
      },
      { keepDirty: false }
    );
  }, [initial, reset]);

  const tabHasError = (tab: TabKey) => {
    const fields = TAB_FIELDS[tab];
    return fields.some((f) => Boolean((errors as Record<string, unknown>)[f]));
  };

  const onValid = async (values: EditOrderValues) => {
    setShowTabErrors(false);

    try {
      const payload = mapUpdateOrderValuesToPayload(values);

      await updateMut.mutateAsync({ orderId, payload });

      onSaved();
    } catch (e) {
      console.log(e);
    }
  };

  const onInvalid = () => setShowTabErrors(true);

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
                value="notes"
                className={tabTriggerClass}
                label={t("tabs.notes")}
                showError={showTabErrors && tabHasError("notes")}
              />
            </TabsList>

            {/* RECORD */}
            <TabsContent value="record" className="mt-6">
              <FieldGroup className="gap-6">
                <Field data-invalid={!!errors.ztNumber}>
                  <FieldLabel htmlFor="ztNumber" required>
                    {t("fields.ztNumber")}
                  </FieldLabel>
                  <Input
                    id="ztNumber"
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
                    render={({ field }) => {
                      // Convert empty string to undefined for Select, but keep actual values
                      const selectValue =
                        field.value && field.value.trim() !== ""
                          ? field.value
                          : undefined;
                      return (
                        <Select
                          key={`timeliness-select-${selectValue || "empty"}-${
                            initial.timelinessStatus || "no-init"
                          }`}
                          value={selectValue}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            aria-invalid={!!errors.timelinessStatus}
                          >
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
                      );
                    }}
                  />
                  {errors.timelinessStatus?.message && (
                    <FieldError>{errors.timelinessStatus.message}</FieldError>
                  )}
                </Field>
              </FieldGroup>
            </TabsContent>

            {/* VEHICLE */}
            <TabsContent value="vehicle" className="mt-6">
              <FieldGroup className="gap-6">
                <Field data-invalid={!!errors.vehiclePlate}>
                  <FieldLabel htmlFor="vehiclePlate" required>
                    {t("fields.vehiclePlate")}
                  </FieldLabel>
                  <Input
                    id="vehiclePlate"
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
                    aria-invalid={!!errors.trailerPlate}
                    {...register("trailerPlate")}
                  />
                  {errors.trailerPlate?.message && (
                    <FieldError>{errors.trailerPlate.message}</FieldError>
                  )}
                </Field>

                <FieldSeparator />

                <Field data-invalid={!!errors.driverFirstName}>
                  <FieldLabel htmlFor="driverFirstName" required>
                    {t("fields.driverFirstName")}
                  </FieldLabel>
                  <Input
                    id="driverFirstName"
                    aria-invalid={!!errors.driverFirstName}
                    {...register("driverFirstName")}
                  />
                  {errors.driverFirstName?.message && (
                    <FieldError>{errors.driverFirstName.message}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.driverLastName}>
                  <FieldLabel htmlFor="driverLastName" required>
                    {t("fields.driverLastName")}
                  </FieldLabel>
                  <Input
                    id="driverLastName"
                    aria-invalid={!!errors.driverLastName}
                    {...register("driverLastName")}
                  />
                  {errors.driverLastName?.message && (
                    <FieldError>{errors.driverLastName.message}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.driverPhone}>
                  <FieldLabel htmlFor="driverPhone" required>
                    {t("fields.driverPhone")}
                  </FieldLabel>
                  <Input
                    id="driverPhone"
                    aria-invalid={!!errors.driverPhone}
                    {...register("driverPhone")}
                  />
                  {errors.driverPhone?.message && (
                    <FieldError>{errors.driverPhone.message}</FieldError>
                  )}
                </Field>
              </FieldGroup>
            </TabsContent>

            {/* PAYER */}
            <TabsContent value="payer" className="mt-6">
              <FieldGroup className="gap-6">
                <Field data-invalid={!!errors.clientName}>
                  <FieldLabel htmlFor="clientName" required>
                    {t("fields.clientName")}
                  </FieldLabel>
                  <Input
                    id="clientName"
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
                    aria-invalid={!!errors.payerEmail}
                    {...register("payerEmail")}
                  />
                  {errors.payerEmail?.message && (
                    <FieldError>{errors.payerEmail.message}</FieldError>
                  )}
                </Field>
              </FieldGroup>
            </TabsContent>

            {/* TRANSPORT */}
            <TabsContent value="transport" className="mt-6">
              <FieldGroup className="gap-6">
                <Field data-invalid={!!errors.fromCountry}>
                  <FieldLabel htmlFor="fromCountry" required>
                    {t("fields.fromCountry")}
                  </FieldLabel>
                  <Input
                    id="fromCountry"
                    aria-invalid={!!errors.fromCountry}
                    {...register("fromCountry")}
                  />
                  {errors.fromCountry?.message && (
                    <FieldError>{errors.fromCountry.message}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.fromAddress}>
                  <FieldLabel htmlFor="fromAddress">
                    {t("fields.fromAddress")}
                  </FieldLabel>
                  <Input
                    id="fromAddress"
                    aria-invalid={!!errors.fromAddress}
                    {...register("fromAddress")}
                  />
                  {errors.fromAddress?.message && (
                    <FieldError>{errors.fromAddress.message}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.toCountry}>
                  <FieldLabel htmlFor="toCountry" required>
                    {t("fields.toCountry")}
                  </FieldLabel>
                  <Input
                    id="toCountry"
                    aria-invalid={!!errors.toCountry}
                    {...register("toCountry")}
                  />
                  {errors.toCountry?.message && (
                    <FieldError>{errors.toCountry.message}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.toAddress}>
                  <FieldLabel htmlFor="toAddress">
                    {t("fields.toAddress")}
                  </FieldLabel>
                  <Input
                    id="toAddress"
                    aria-invalid={!!errors.toAddress}
                    {...register("toAddress")}
                  />
                  {errors.toAddress?.message && (
                    <FieldError>{errors.toAddress.message}</FieldError>
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

                <Field data-invalid={!!errors.loadingTime}>
                  <FieldLabel htmlFor="loadingTime">
                    {t("fields.loadingTime")}
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({t("optional")})
                    </span>
                  </FieldLabel>
                  <Input
                    id="loadingTime"
                    type="time"
                    aria-invalid={!!errors.loadingTime}
                    {...register("loadingTime")}
                  />
                  {errors.loadingTime?.message && (
                    <FieldError>{errors.loadingTime.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="cargoDescription">
                    {t("fields.cargoDescription")}
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({t("optional")})
                    </span>
                  </FieldLabel>
                  <Textarea
                    id="cargoDescription"
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

            {/* NOTES */}
            <TabsContent value="notes" className="mt-6">
              <FieldGroup className="gap-6">
                <Field>
                  <FieldLabel htmlFor="notes">
                    {t("fields.notes")}
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({t("optional")})
                    </span>
                  </FieldLabel>
                  <Textarea
                    id="notes"
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
              disabled={isSubmitting || updateMut.isPending}
              className={cn(
                "w-full rounded-xl py-6 text-base",
                "bg-[#F2542F] hover:bg-[#F2542F]/90"
              )}
            >
              {isSubmitting || updateMut.isPending ? (
                <>
                  <Spinner />
                  {t("buttons.saving")}
                </>
              ) : (
                t("buttons.save")
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
