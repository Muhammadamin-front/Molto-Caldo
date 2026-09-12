import { getTranslations } from "next-intl/server";
import {
  TestimonialsSection,
  type Testimonial,
} from "@/components/ui/testimonials-6";
import type { Locale } from "@/i18n/routing";

const QUOTES: Record<Locale, Testimonial[]> = {
  uz: [
    { quote: "Paltoni qishning eng sovuq kunida kiydim — shamol o'tmadi. O'lcham jadvali ham aniq chiqdi.", image: "/people/dilnoza.jpg", name: "Dilnoza A.", role: "Toshkent" },
    { quote: "Ikki hafta kiyib yurdim, hech qayeri cho'zilmadi. Tikuvi juda toza.", image: "/people/javohir.jpg", name: "Javohir T.", role: "Samarqand" },
    { quote: "O'lcham kichik keldi, almashtirishdi. Hech qanday bahs bo'lmadi.", image: "/people/kamola.jpg", name: "Kamola N.", role: "Buxoro" },
    { quote: "Sviter merinosdan — teriga qichishmaydi. Shuning uchun oldim va afsuslanmadim.", image: "/people/aziz.jpg", name: "Aziz M.", role: "Toshkent" },
    { quote: "Buyurtmadan keyin ikki kunda yetib keldi. Qadoqlash ham chiroyli edi.", image: "/people/nodira.jpg", name: "Nodira S.", role: "Farg'ona" },
    { quote: "Narxi arzon emas, lekin sifati bir necha mavsumga yetadi. Shunga arziydi.", image: "/people/sardor.jpg", name: "Sardor R.", role: "Namangan" },
  ],
  ru: [
    { quote: "Надела пальто в самый холодный день — ветер не продувает. Таблица размеров тоже совпала.", image: "/people/dilnoza.jpg", name: "Дилноза А.", role: "Ташкент" },
    { quote: "Носил две недели, нигде не растянулось. Пошив очень аккуратный.", image: "/people/javohir.jpg", name: "Джавохир Т.", role: "Самарканд" },
    { quote: "Размер оказался мал — обменяли без единого спора.", image: "/people/kamola.jpg", name: "Камола Н.", role: "Бухара" },
    { quote: "Свитер из мериноса — не колется. Взяла поэтому и не пожалела.", image: "/people/aziz.jpg", name: "Азиз М.", role: "Ташкент" },
    { quote: "Пришло за два дня после заказа. Упаковка тоже приятная.", image: "/people/nodira.jpg", name: "Нодира С.", role: "Фергана" },
    { quote: "Цена не низкая, но качества хватит на несколько сезонов. Оно того стоит.", image: "/people/sardor.jpg", name: "Сардор Р.", role: "Наманган" },
  ],
  en: [
    { quote: "I wore the coat on the coldest day of winter and the wind did not get through. The size chart was accurate too.", image: "/people/dilnoza.jpg", name: "Dilnoza A.", role: "Tashkent" },
    { quote: "Two weeks of wear and nothing has stretched. The stitching is very clean.", image: "/people/javohir.jpg", name: "Javohir T.", role: "Samarkand" },
    { quote: "The size came up small and they exchanged it. No argument at all.", image: "/people/kamola.jpg", name: "Kamola N.", role: "Bukhara" },
    { quote: "The sweater is merino, so it does not itch. That is why I bought it and I do not regret it.", image: "/people/aziz.jpg", name: "Aziz M.", role: "Tashkent" },
    { quote: "It arrived two days after the order. The packaging was lovely as well.", image: "/people/nodira.jpg", name: "Nodira S.", role: "Fergana" },
    { quote: "Not cheap, but the quality will last several seasons. Worth it.", image: "/people/sardor.jpg", name: "Sardor R.", role: "Namangan" },
  ],
};

export async function Reviews({ locale }: { locale: Locale }) {
  const t = await getTranslations("reviews");

  return (
    <section className="mc-container py-16">
      <TestimonialsSection
        items={QUOTES[locale]}
        label={t("eyebrow")}
        title={t("title")}
        lead={t("lead")}
      />
    </section>
  );
}
