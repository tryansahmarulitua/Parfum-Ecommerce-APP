import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { Product, Review } from '@/types';
import { Heart, X, ZoomIn } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from '@/components/ui/carousel';

const fmt = (x: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(x);
const PLACEHOLDER = '/placeholder.png';

export default function ProductDetail({ id }: { id: string }) {
    const { isAuthenticated } = useAuth();
    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [related, setRelated] = useState<Product[]>([]);
    const [qty, setQty] = useState(1);
    const [activeImg, setActiveImg] = useState(0);
    const [carouselApi, setCarouselApi] = useState<CarouselApi>();
    const [isZoomed, setIsZoomed] = useState(false);
    const [inWishlist, setInWishlist] = useState(false);
    const [error, setError] = useState('');

    const gallery = useMemo(() => {
        if (!product) return [PLACEHOLDER];
        const imgs = Array.isArray(product.images)
            ? product.images.map(i => i.image).filter(Boolean)
            : [];
        if (product.thumbnail) imgs.unshift(product.thumbnail);
        return imgs.length > 0 ? imgs : [PLACEHOLDER];
    }, [product]);

    useEffect(() => {
        api.get(`/products/${id}`).then(r => {
            const p = r.data?.data ?? r.data;
            if (!p || typeof p !== 'object' || !p.id) {
                setError('Produk tidak ditemukan.');
                setProduct(null);
                return;
            }
            setProduct(p);
            setReviews(p.reviews ?? []);
            setActiveImg(0);
            if (p.category_id) {
                api.get('/products', { params: { category_id: p.category_id, per_page: 4 } })
                    .then(rr => {
                        const list = rr.data.data?.data ?? rr.data.data ?? [];
                        setRelated(list.filter((x: Product) => x && x.id && x.id !== p.id).slice(0, 4));
                    }).catch(() => {});
            }
        }).catch(() => setError('Produk tidak ditemukan.'));
    }, [id]);

    useEffect(() => {
        if (!carouselApi) return;
        carouselApi.scrollTo(activeImg);
        carouselApi.on('select', () => {
            setActiveImg(carouselApi.selectedScrollSnap());
        });
    }, [carouselApi]);

    const handleThumbnailClick = (i: number) => {
        setActiveImg(i);
        carouselApi?.scrollTo(i);
    };

    useEffect(() => {
        if (isAuthenticated && product?.id) {
            api.get('/wishlist').then(r => {
                const list = r.data?.data?.data ?? r.data?.data ?? [];
                const found = Array.isArray(list) && list.some((item: any) => item.id === product.id);
                setInWishlist(found);
            }).catch(() => {});
        }
    }, [isAuthenticated, product?.id]);

    const addToCart = async () => {
        if (!isAuthenticated) {
            router.visit('/login');
            return;
        }
        if (!product?.id) return;
        try {
            await api.post('/cart', { product_id: product.id, quantity: qty });
            router.visit('/cart');
        } catch (err) {
            console.error(err);
        }
    };

    const toggleWishlist = async () => {
        if (!isAuthenticated) {
            router.visit('/login');
            return;
        }
        if (!product?.id) return;
        try {
            if (inWishlist) {
                await api.delete(`/wishlist/${product.id}`);
                setInWishlist(false);
            } else {
                await api.post('/wishlist', { product_id: product.id });
                setInWishlist(true);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (error) return <UserLayout><div className="p-10 text-center text-red-500">{error}</div></UserLayout>;
    if (!product) return <UserLayout><div className="p-10 text-center">Loading...</div></UserLayout>;

    const price = product.effective_price ?? product.discount_price ?? product.price;

    return (
        <UserLayout>
            <Head title={product.name} />
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2">
                    <Carousel setApi={setCarouselApi} className="w-full">
                        <CarouselContent>
                            {gallery.map((src, i) => (
                                <CarouselItem key={i}>
                                    <div className="relative group cursor-zoom-in" onClick={() => setIsZoomed(true)}>
                                        <img src={src} alt={`${product.name} ${i + 1}`}
                                            onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                                            className="w-full h-96 object-cover rounded-base border-2 border-border bg-secondary-background" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-base">
                                            <span className="bg-background text-foreground text-xs font-bold px-3 py-1.5 rounded-base border-2 border-border shadow-shadow flex items-center gap-1.5">
                                                <ZoomIn className="w-4 h-4" /> Klik untuk Zoom
                                            </span>
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        {gallery.length > 1 && (
                            <>
                                <CarouselPrevious className="left-2" />
                                <CarouselNext className="right-2" />
                            </>
                        )}
                    </Carousel>
                    {gallery.length > 1 && (
                        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                            {gallery.map((src, i) => (
                                <img key={i} src={src} alt="" onClick={() => handleThumbnailClick(i)}
                                    onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                                    className={`w-16 h-16 object-cover rounded-base cursor-pointer border-2 shrink-0 ${i === activeImg ? 'border-main' : 'border-border'}`} />
                            ))}
                        </div>
                    )}
                </div>

                <div className="md:w-1/2 space-y-3">
                    <p className="text-sm text-foreground/60">{product.brand?.name}</p>
                    <h1 className="text-3xl font-bold">{product.name}</h1>
                    <p className="text-sm text-foreground/60">{product.category?.name} · {product.gender}</p>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl text-main font-bold">{fmt(price)}</p>
                        {product.discount_price && (
                            <p className="text-sm text-foreground/50 line-through">{fmt(product.price)}</p>
                        )}
                    </div>
                    {product.avg_rating ? (
                        <p className="text-yellow-500 text-sm">{'★'.repeat(Math.round(product.avg_rating))} ({product.avg_rating}) · {product.reviews_count ?? reviews.length} ulasan</p>
                    ) : null}
                    {product.description && <p className="text-foreground">{product.description}</p>}

                    {(product.top_notes || product.middle_notes || product.base_notes) && (
                        <div className="grid grid-cols-3 gap-2 text-sm">
                            {product.top_notes && <div className="bg-main/10 p-2 rounded-base border-2 border-border"><strong>Top:</strong> {product.top_notes}</div>}
                            {product.middle_notes && <div className="bg-main/10 p-2 rounded-base border-2 border-border"><strong>Middle:</strong> {product.middle_notes}</div>}
                            {product.base_notes && <div className="bg-main/10 p-2 rounded-base border-2 border-border"><strong>Base:</strong> {product.base_notes}</div>}
                        </div>
                    )}

                    <p className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {product.stock > 0 ? `In stock (${product.stock})` : 'Out of stock'}
                    </p>

                    {product.stock > 0 && (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center border-2 border-border rounded-base">
                                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 border-r-2 border-border">-</button>
                                <input
                                    type="number"
                                    min={1}
                                    max={product.stock}
                                    value={qty}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value, 10);
                                        if (!isNaN(val) && val >= 1) {
                                            setQty(Math.min(val, product.stock));
                                        }
                                    }}
                                    className="w-14 text-center text-sm font-semibold bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-3 py-2 border-l-2 border-border">+</button>
                            </div>
                            <button onClick={addToCart}
                                className="bg-main text-main-foreground font-semibold px-6 py-2 rounded-base border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all">
                                Add to Cart
                            </button>
                            <button onClick={toggleWishlist}
                                title={inWishlist ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
                                className={`p-2.5 rounded-base border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all ${inWishlist ? 'bg-red-100 text-red-600' : 'bg-secondary-background text-foreground hover:text-red-500'}`}>
                                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {reviews.length > 0 && (
                <section className="mt-10">
                    <h2 className="text-xl font-bold mb-4">Reviews</h2>
                    {reviews.map(r => (
                        <div key={r.id} className="border-2 border-border p-3 rounded-base mb-2 bg-secondary-background">
                            <p className="font-semibold">{r.user?.name}</p>
                            <p className="text-yellow-500 text-sm">{'★'.repeat(r.rating)}</p>
                            <p className="text-foreground text-sm">{r.comment}</p>
                        </div>
                    ))}
                </section>
            )}

            {related.length > 0 && (
                <section className="mt-10">
                    <h2 className="text-xl font-bold mb-4">Produk Terkait</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {related.map(p => (
                            <Link key={p.id} href={`/products/${p.id}`}
                                className="bg-secondary-background border-2 border-border rounded-base overflow-hidden shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all">
                                <img src={p.images?.[0]?.image ?? p.thumbnail ?? PLACEHOLDER} alt={p.name}
                                    onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                                    className="w-full h-48 object-cover border-b-2 border-border" />
                                <div className="p-3">
                                    <p className="text-xs text-foreground/60">{p.brand?.name}</p>
                                    <h3 className="font-semibold truncate">{p.name}</h3>
                                    <p className="text-main font-bold">{fmt(p.effective_price ?? p.price)}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {isZoomed && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setIsZoomed(false)}>
                    <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center"
                        onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setIsZoomed(false)}
                            className="absolute -top-12 right-0 text-white bg-black/50 hover:bg-black p-2 rounded-full border border-white/20 transition-all z-10">
                            <X className="w-6 h-6" />
                        </button>
                        <Carousel opts={{ startIndex: activeImg }} className="w-full max-w-3xl">
                            <CarouselContent>
                                {gallery.map((src, i) => (
                                    <CarouselItem key={i} className="flex items-center justify-center">
                                        <img src={src} alt={`${product.name} ${i + 1}`}
                                            onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                                            className="max-w-full max-h-[80vh] object-contain rounded-base border-2 border-border shadow-2xl bg-secondary-background" />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            {gallery.length > 1 && (
                                <>
                                    <CarouselPrevious className="left-2 text-white bg-black/50 border-white/20" />
                                    <CarouselNext className="right-2 text-white bg-black/50 border-white/20" />
                                </>
                            )}
                        </Carousel>
                    </div>
                </div>
            )}
        </UserLayout>
    );
}
