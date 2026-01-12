import { getTranslations } from "next-intl/server";
import { mockOrders } from "@/features/orders/lib/mock-orders";
import OrdersPageHeader from "@/features/orders/components/orders-page-header";
import OrdersView from "@/features/orders/components/orders-view";

export default async function OrdersPage() {
  const t = await getTranslations("OrdersPage");

  return (
    <>
      <OrdersPageHeader
        title={t("title")}
        ctaLabel={t("create")}
        ctaHref="/dashboard/orders/new"
      />

      <OrdersView
        items={mockOrders(12)}
        i18n={{
          detailsTitle: t("details.title"),
          detailsSubtitle: t("details.subtitle"),
          close: t("details.close"),
        }}
      />
    </>
  );
}
