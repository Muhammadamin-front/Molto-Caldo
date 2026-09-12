import { cn } from "@/lib/utils";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Testimonial = {
  quote: string;
  image: string;
  name: string;
  role: string;
  company?: string;
};

const testimonials: Testimonial[] = [
  {
    quote: "Paltoni qishning eng sovuq kunida kiydim — shamol o'tmadi.",
    image: "/people/dilnoza.jpg",
    name: "Dilnoza A.",
    role: "Toshkent",
    company: "Molto Caldo",
  },
  {
    quote: "Ikki hafta kiyib yurdim, hech qayeri cho'zilmadi.",
    image: "/people/javohir.jpg",
    name: "Javohir T.",
    role: "Samarqand",
    company: "Molto Caldo",
  },
  {
    quote: "O'lcham kichik keldi, almashtirishdi. Bahs bo'lmadi.",
    image: "/people/kamola.jpg",
    name: "Kamola N.",
    role: "Buxoro",
    company: "Molto Caldo",
  },
  {
    quote: "Sviter merinosdan — teriga qichishmaydi.",
    image: "/people/aziz.jpg",
    name: "Aziz M.",
    role: "Toshkent",
    company: "Molto Caldo",
  },
  {
    quote: "Buyurtmadan keyin ikki kunda yetib keldi.",
    image: "/people/nodira.jpg",
    name: "Nodira S.",
    role: "Farg'ona",
    company: "Molto Caldo",
  },
  {
    quote: "Sifati bir necha mavsumga yetadi. Shunga arziydi.",
    image: "/people/sardor.jpg",
    name: "Sardor R.",
    role: "Namangan",
    company: "Molto Caldo",
  },
];


export type { Testimonial };

export function TestimonialsSection({
  items,
  label = "Testimonials",
  title = "What our users say",
  lead = "See what our customers have to say about us.",
}: {
  items?: Testimonial[];
  label?: string;
  title?: string;
  lead?: string;
} = {}) {
  const list = items && items.length > 0 ? items : testimonials;
  const firstColumn = list.slice(0, 3);
  const secondColumn = list.slice(3, 6);
  const thirdColumn = list.slice(6, 9);

  return (
    <section className="relative py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-4">
          <div className="flex justify-center">
            <div className="rounded-lg border px-4 py-1">{label}</div>
          </div>

          <h2 className="font-bold text-3xl tracking-tighter lg:text-4xl">
            {title}
          </h2>
          <p className="text-center text-muted-foreground text-sm">
            {lead}
          </p>
        </div>

        <div
          className={cn(
            "mt-10 flex max-h-160 justify-center gap-6 overflow-hidden",
            "mask-[linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]",
          )}
        >
          <InfiniteSlider direction="vertical" speed={30} speedOnHover={15}>
            {firstColumn.map((testimonial) => (
              <TestimonialsCard
                key={testimonial.name}
                testimonial={testimonial}
              />
            ))}
          </InfiniteSlider>
          <InfiniteSlider
            className="hidden md:block"
            direction="vertical"
            speed={50}
            speedOnHover={25}
          >
            {secondColumn.map((testimonial) => (
              <TestimonialsCard
                key={testimonial.name}
                testimonial={testimonial}
              />
            ))}
          </InfiniteSlider>
          <InfiniteSlider
            className="hidden lg:block"
            direction="vertical"
            speed={35}
            speedOnHover={17}
          >
            {thirdColumn.map((testimonial) => (
              <TestimonialsCard
                key={testimonial.name}
                testimonial={testimonial}
              />
            ))}
          </InfiniteSlider>
        </div>
      </div>
    </section>
  );
}

function TestimonialsCard({
  testimonial,
  className,
  ...props
}: React.ComponentProps<"figure"> & {
  testimonial: Testimonial;
}) {
  const { quote, image, name, role, company } = testimonial;
  return (
    <figure
      className={cn(
        "w-full max-w-xs rounded-3xl border bg-card p-8 shadow-foreground/10 shadow-lg dark:bg-card/20",
        className,
      )}
      {...props}
    >
      <blockquote>{quote}</blockquote>
      <figcaption className="mt-5 flex items-center gap-2">
        <Avatar className="size-8 rounded-full">
          <AvatarImage alt={`${name}'s profile picture`} src={image} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <cite className="font-medium not-italic leading-5 tracking-tight">
            {name}
          </cite>
          <span className="text-muted-foreground text-sm leading-5 tracking-tight">
            {role} {company && `, ${company}`}
          </span>
        </div>
      </figcaption>
    </figure>
  );
}

export default TestimonialsSection;
