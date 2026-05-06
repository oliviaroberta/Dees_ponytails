import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import backgroundImage from "@/assets/background.jpg";
import { apiRequest } from "@/lib/api";
import type { GalleryItem } from "@/types/gallery";
import PaginationControls from "@/components/PaginationControls";

const GALLERY_ITEMS_PER_PAGE = 9;

const Gallery = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "IMAGE" | "VIDEO">("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest<{ items: GalleryItem[] }>("/gallery");
        if (isMounted) {
          setItems(response.items);
        }
      } catch {
        if (isMounted) {
          setItems([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredItems = useMemo(
    () => (filter === "ALL" ? items : items.filter((item) => item.mediaType === filter)),
    [filter, items],
  );
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / GALLERY_ITEMS_PER_PAGE));
  const paginatedItems = useMemo(
    () =>
      filteredItems.slice(
        (currentPage - 1) * GALLERY_ITEMS_PER_PAGE,
        currentPage * GALLERY_ITEMS_PER_PAGE,
      ),
    [currentPage, filteredItems],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div
      className="relative min-h-screen bg-scroll lg:bg-fixed"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-background/72" />
      <div className="relative z-10">
        <Navbar />
        <CartDrawer />

        <main className="container mx-auto px-4 pb-20 pt-28 lg:px-8">
          <section className="rounded-[2rem] border border-border/60 bg-card/85 px-6 py-10 text-center backdrop-blur md:px-10">
            <p className="font-body text-sm uppercase tracking-[0.3em] text-muted-foreground">
              Client Gallery
            </p>
            <h1 className="mt-4 font-display text-4xl font-light text-foreground md:text-5xl">
              Real Looks, Real <span className="font-semibold italic">Customers</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-body text-sm leading-relaxed text-muted-foreground">
              A closer look at ponytails worn by our clients. Browse photos and videos uploaded by
              Dees_ponytails from customer submissions.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {[
                { label: "All", value: "ALL" as const },
                { label: "Photos", value: "IMAGE" as const },
                { label: "Videos", value: "VIDEO" as const },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  className={`rounded-full px-4 py-2 font-body text-xs uppercase tracking-[0.2em] transition-colors ${
                    filter === option.value
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background/70 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-8">
            {isLoading ? (
              <div className="rounded-[2rem] border border-border/60 bg-card/80 p-10 text-center backdrop-blur">
                <p className="font-body text-sm text-muted-foreground">Loading gallery...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="rounded-[2rem] border border-border/60 bg-card/80 p-10 text-center backdrop-blur">
                <p className="font-body text-sm text-muted-foreground">
                  No gallery items have been published yet.
                </p>
              </div>
            ) : (
              <>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {paginatedItems.map((item) => (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-card/85 backdrop-blur"
                  >
                    <div className="bg-background/55">
                      {item.mediaType === "VIDEO" ? (
                        <video
                          src={item.mediaUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className="aspect-[4/5] w-full object-cover"
                        />
                      ) : (
                        <img
                          src={item.mediaUrl}
                          alt={item.caption || item.customerName || "Gallery image"}
                          loading="lazy"
                          className="aspect-[4/5] w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="space-y-2 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-display text-xl font-semibold text-foreground">
                          {item.customerName || "Dees_ponytails Client"}
                        </p>
                        <span className="rounded-full border border-border px-3 py-1 font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          {item.mediaType === "VIDEO" ? "Video" : "Photo"}
                        </span>
                      </div>
                      {item.caption ? (
                        <p className="font-body text-sm leading-relaxed text-muted-foreground">
                          {item.caption}
                        </p>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={GALLERY_ITEMS_PER_PAGE}
                totalItems={filteredItems.length}
                itemLabel="gallery item"
                onPageChange={setCurrentPage}
              />
              </>
            )}
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Gallery;
