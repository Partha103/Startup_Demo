package com.backend1.service;

import com.backend1.model.MongoDocuments.CatalogCollectionDocument;
import com.backend1.model.MongoDocuments.InventoryDocument;
import com.backend1.model.MongoDocuments.ProductDocument;
import com.backend1.model.MongoDocuments.ProductVariantDocument;
import com.backend1.model.MongoDocuments.UserDocument;
import com.backend1.security.CredentialHashService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeds the TANTA store catalogue on first startup.
 * Collections, products, variants and inventory records reflect the
 * TANTA brand — luxury ready-to-wear for the discerning customer.
 */
@Component
public class StoreDataInitializer implements ApplicationRunner {

    private final MongoTemplate        mongoTemplate;
    private final MongoSequenceService sequenceService;
    private final CredentialHashService credentialHashService;

    public StoreDataInitializer(MongoTemplate mongoTemplate,
                                MongoSequenceService sequenceService,
                                CredentialHashService credentialHashService) {
        this.mongoTemplate        = mongoTemplate;
        this.sequenceService      = sequenceService;
        this.credentialHashService = credentialHashService;
    }

    @Override
    public void run(ApplicationArguments args) {
        seedAdminIfMissing();
        seedCatalogIfEmpty();
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Catalogue seed
    // ─────────────────────────────────────────────────────────────────────────

    public void seedCatalogIfEmpty() {
        if (mongoTemplate.count(new Query(), ProductDocument.class) > 0) {
            return;
        }

        // ── Collections ──────────────────────────────────────────────────────
        mongoTemplate.save(new CatalogCollectionDocument(1L, 1,
                "Tanta Blanc",
                "Clean, ivory-toned essentials built on refined minimalism.",
                "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"
        ));
        mongoTemplate.save(new CatalogCollectionDocument(2L, 2,
                "TANTA Nuit",
                "After-dark tailoring kissed in gold — evening dressing elevated.",
                "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80"
        ));
        mongoTemplate.save(new CatalogCollectionDocument(3L, 3,
                "TANTA Capsule",
                "Timeless capsule wardrobe — twelve pieces, infinite combinations.",
                "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"
        ));

        // ── Products ─────────────────────────────────────────────────────────

        // 1. Ivory Cashmere Overcoat
        seedProduct(1L, "TAN-001", 1L,
                "Ivory Cashmere Overcoat",
                "Hand-finished in our Italian atelier, this double-faced cashmere overcoat drapes with extraordinary weight and warmth. A TANTA signature.",
                "outerwear", "coats", "oversized", "100% Grade-A Cashmere",
                List.of(
                    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80"
                ),
                List.of(
                    variant("TAN-001-IVY-XS", "XS", "Ivory",     "1290.00"),
                    variant("TAN-001-IVY-S",  "S",  "Ivory",     "1290.00"),
                    variant("TAN-001-IVY-M",  "M",  "Ivory",     "1290.00"),
                    variant("TAN-001-IVY-L",  "L",  "Ivory",     "1290.00"),
                    variant("TAN-001-NOI-S",  "S",  "Noir",      "1290.00"),
                    variant("TAN-001-NOI-M",  "M",  "Noir",      "1290.00"),
                    variant("TAN-001-TAU-M",  "M",  "Taupe",     "1290.00")
                ));
        inv(1L,"TAN-001-IVY-XS","Ivory Cashmere Overcoat","XS","Ivory","TAN-PARIS-WH","WAREHOUSE","EU",6,2);
        inv(1L,"TAN-001-IVY-S", "Ivory Cashmere Overcoat","S", "Ivory","TAN-PARIS-WH","WAREHOUSE","EU",12,3);
        inv(1L,"TAN-001-IVY-M", "Ivory Cashmere Overcoat","M", "Ivory","TAN-PARIS-WH","WAREHOUSE","EU",14,3);
        inv(1L,"TAN-001-IVY-L", "Ivory Cashmere Overcoat","L", "Ivory","TAN-LONDON-WH","WAREHOUSE","UK",8,2);
        inv(1L,"TAN-001-NOI-S", "Ivory Cashmere Overcoat","S", "Noir","TAN-PARIS-WH","WAREHOUSE","EU",10,3);
        inv(1L,"TAN-001-NOI-M", "Ivory Cashmere Overcoat","M", "Noir","TAN-NYC-WH","WAREHOUSE","US",9,3);
        inv(1L,"TAN-001-TAU-M", "Ivory Cashmere Overcoat","M", "Taupe","TAN-NYC-WH","WAREHOUSE","US",7,2);

        // 2. Champagne Silk Slip Dress
        seedProduct(2L, "TAN-002", 2L,
                "Champagne Silk Slip Dress",
                "Cut from 22mm Charmeuse silk in a luminous champagne, this bias-cut slip dress moves like a second skin. Wear alone or layered.",
                "dresses", "slip-dresses", "slim", "100% Silk Charmeuse",
                List.of(
                    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=900&q=80"
                ),
                List.of(
                    variant("TAN-002-CHP-XS", "XS", "Champagne", "640.00"),
                    variant("TAN-002-CHP-S",  "S",  "Champagne", "640.00"),
                    variant("TAN-002-CHP-M",  "M",  "Champagne", "640.00"),
                    variant("TAN-002-CHP-L",  "L",  "Champagne", "640.00"),
                    variant("TAN-002-IVY-S",  "S",  "Ivory",     "640.00"),
                    variant("TAN-002-IVY-M",  "M",  "Ivory",     "640.00")
                ));
        inv(2L,"TAN-002-CHP-XS","Champagne Silk Slip Dress","XS","Champagne","TAN-PARIS-WH","WAREHOUSE","EU",8,2);
        inv(2L,"TAN-002-CHP-S", "Champagne Silk Slip Dress","S", "Champagne","TAN-PARIS-WH","WAREHOUSE","EU",16,4);
        inv(2L,"TAN-002-CHP-M", "Champagne Silk Slip Dress","M", "Champagne","TAN-NYC-WH","WAREHOUSE","US",14,4);
        inv(2L,"TAN-002-CHP-L", "Champagne Silk Slip Dress","L", "Champagne","TAN-LONDON-WH","WAREHOUSE","UK",6,2);
        inv(2L,"TAN-002-IVY-S", "Champagne Silk Slip Dress","S", "Ivory","TAN-PARIS-WH","WAREHOUSE","EU",10,3);
        inv(2L,"TAN-002-IVY-M", "Champagne Silk Slip Dress","M", "Ivory","TAN-NYC-WH","WAREHOUSE","US",9,3);

        // 3. Midnight Tailored Blazer
        seedProduct(3L, "TAN-003", 2L,
                "Midnight Tailored Blazer",
                "Single-breasted, constructed in Italian wool-twill. Padded shoulders and a nipped waist create a silhouette of quiet authority.",
                "tailoring", "blazers", "tailored", "Italian Wool Twill",
                List.of(
                    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80"
                ),
                List.of(
                    variant("TAN-003-MID-XS", "XS", "Midnight", "890.00"),
                    variant("TAN-003-MID-S",  "S",  "Midnight", "890.00"),
                    variant("TAN-003-MID-M",  "M",  "Midnight", "890.00"),
                    variant("TAN-003-MID-L",  "L",  "Midnight", "890.00"),
                    variant("TAN-003-CRE-S",  "S",  "Cream",    "890.00"),
                    variant("TAN-003-CRE-M",  "M",  "Cream",    "890.00"),
                    variant("TAN-003-CHC-M",  "M",  "Charcoal", "890.00")
                ));
        inv(3L,"TAN-003-MID-XS","Midnight Tailored Blazer","XS","Midnight","TAN-PARIS-WH","WAREHOUSE","EU",6,2);
        inv(3L,"TAN-003-MID-S", "Midnight Tailored Blazer","S", "Midnight","TAN-PARIS-WH","WAREHOUSE","EU",11,3);
        inv(3L,"TAN-003-MID-M", "Midnight Tailored Blazer","M", "Midnight","TAN-NYC-WH","WAREHOUSE","US",13,3);
        inv(3L,"TAN-003-MID-L", "Midnight Tailored Blazer","L", "Midnight","TAN-LONDON-WH","WAREHOUSE","UK",7,2);
        inv(3L,"TAN-003-CRE-S", "Midnight Tailored Blazer","S", "Cream","TAN-PARIS-WH","WAREHOUSE","EU",8,2);
        inv(3L,"TAN-003-CRE-M", "Midnight Tailored Blazer","M", "Cream","TAN-NYC-WH","WAREHOUSE","US",6,2);
        inv(3L,"TAN-003-CHC-M", "Midnight Tailored Blazer","M", "Charcoal","TAN-LONDON-WH","WAREHOUSE","UK",9,3);

        // 4. Sage Linen Wide Trousers
        seedProduct(4L, "TAN-004", 3L,
                "Sage Linen Wide Trousers",
                "High-rise wide-leg trousers in pre-washed Belgian linen. The sage colourway brings a quiet freshness to effortless summer dressing.",
                "trousers", "wide-leg", "wide", "Belgian Linen",
                List.of(
                    "https://images.unsplash.com/photo-1506629905607-d9c36e0a0b14?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80"
                ),
                List.of(
                    variant("TAN-004-SGE-XS", "XS", "Sage",   "320.00"),
                    variant("TAN-004-SGE-S",  "S",  "Sage",   "320.00"),
                    variant("TAN-004-SGE-M",  "M",  "Sage",   "320.00"),
                    variant("TAN-004-SGE-L",  "L",  "Sage",   "320.00"),
                    variant("TAN-004-IVY-S",  "S",  "Ivory",  "320.00"),
                    variant("TAN-004-IVY-M",  "M",  "Ivory",  "320.00"),
                    variant("TAN-004-NOI-M",  "M",  "Noir",   "320.00")
                ));
        inv(4L,"TAN-004-SGE-XS","Sage Linen Wide Trousers","XS","Sage","TAN-PARIS-WH","WAREHOUSE","EU",9,3);
        inv(4L,"TAN-004-SGE-S", "Sage Linen Wide Trousers","S", "Sage","TAN-PARIS-WH","WAREHOUSE","EU",18,4);
        inv(4L,"TAN-004-SGE-M", "Sage Linen Wide Trousers","M", "Sage","TAN-NYC-WH","WAREHOUSE","US",16,4);
        inv(4L,"TAN-004-SGE-L", "Sage Linen Wide Trousers","L", "Sage","TAN-LONDON-WH","WAREHOUSE","UK",10,3);
        inv(4L,"TAN-004-IVY-S", "Sage Linen Wide Trousers","S", "Ivory","TAN-PARIS-WH","WAREHOUSE","EU",12,3);
        inv(4L,"TAN-004-IVY-M", "Sage Linen Wide Trousers","M", "Ivory","TAN-NYC-WH","WAREHOUSE","US",11,3);
        inv(4L,"TAN-004-NOI-M", "Sage Linen Wide Trousers","M", "Noir","TAN-LONDON-WH","WAREHOUSE","UK",8,2);

        // 5. Ivory Cotton Oxford Shirt
        seedProduct(5L, "TAN-005", 1L,
                "Ivory Cotton Oxford Shirt",
                "Woven in Portugal from long-staple Egyptian cotton. A perfect relaxed fit with an oversized collar — the daily essential reimagined.",
                "tops", "shirts", "relaxed", "Egyptian Cotton Oxford",
                List.of(
                    "https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1470309864661-68328b2cd0a5?auto=format&fit=crop&w=900&q=80"
                ),
                List.of(
                    variant("TAN-005-IVY-XS", "XS", "Ivory",  "280.00"),
                    variant("TAN-005-IVY-S",  "S",  "Ivory",  "280.00"),
                    variant("TAN-005-IVY-M",  "M",  "Ivory",  "280.00"),
                    variant("TAN-005-IVY-L",  "L",  "Ivory",  "280.00"),
                    variant("TAN-005-IVY-XL", "XL", "Ivory",  "280.00"),
                    variant("TAN-005-BLU-S",  "S",  "Sky",    "280.00"),
                    variant("TAN-005-BLU-M",  "M",  "Sky",    "280.00")
                ));
        inv(5L,"TAN-005-IVY-XS","Ivory Cotton Oxford Shirt","XS","Ivory","TAN-PARIS-WH","WAREHOUSE","EU",10,3);
        inv(5L,"TAN-005-IVY-S", "Ivory Cotton Oxford Shirt","S", "Ivory","TAN-PARIS-WH","WAREHOUSE","EU",24,5);
        inv(5L,"TAN-005-IVY-M", "Ivory Cotton Oxford Shirt","M", "Ivory","TAN-NYC-WH","WAREHOUSE","US",22,5);
        inv(5L,"TAN-005-IVY-L", "Ivory Cotton Oxford Shirt","L", "Ivory","TAN-LONDON-WH","WAREHOUSE","UK",16,4);
        inv(5L,"TAN-005-IVY-XL","Ivory Cotton Oxford Shirt","XL","Ivory","TAN-NYC-WH","WAREHOUSE","US",8,2);
        inv(5L,"TAN-005-BLU-S", "Ivory Cotton Oxford Shirt","S", "Sky","TAN-PARIS-WH","WAREHOUSE","EU",14,3);
        inv(5L,"TAN-005-BLU-M", "Ivory Cotton Oxford Shirt","M", "Sky","TAN-NYC-WH","WAREHOUSE","US",12,3);

        // 6. Gold-Clasp Leather Tote
        seedProduct(6L, "TAN-006", 2L,
                "Gold-Clasp Leather Tote",
                "Full-grain Italian calf-leather with a brushed-gold turn-lock clasp. Hand-stitched edges and a suede interior — a bag that only improves with time.",
                "accessories", "bags", "regular", "Italian Calf Leather",
                List.of(
                    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?auto=format&fit=crop&w=900&q=80"
                ),
                List.of(
                    variant("TAN-006-CAR-OS", "One Size", "Caramel",  "1490.00"),
                    variant("TAN-006-NOI-OS", "One Size", "Noir",     "1490.00"),
                    variant("TAN-006-TAU-OS", "One Size", "Taupe",    "1490.00")
                ));
        inv(6L,"TAN-006-CAR-OS","Gold-Clasp Leather Tote","One Size","Caramel","TAN-PARIS-WH","WAREHOUSE","EU",5,2);
        inv(6L,"TAN-006-NOI-OS","Gold-Clasp Leather Tote","One Size","Noir","TAN-NYC-WH","WAREHOUSE","US",6,2);
        inv(6L,"TAN-006-TAU-OS","Gold-Clasp Leather Tote","One Size","Taupe","TAN-LONDON-WH","WAREHOUSE","UK",4,2);

        // 7. Cashmere Ribbed Turtleneck
        seedProduct(7L, "TAN-007", 3L,
                "Cashmere Ribbed Turtleneck",
                "Knitted in Scotland from 2-ply Mongolian cashmere. A fine rib pattern that holds its shape, season after season.",
                "knitwear", "jumpers", "slim", "2-ply Mongolian Cashmere",
                List.of(
                    "https://images.unsplash.com/photo-1520367551-3395bdc7ecf6?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1511401139252-f158d3209c17?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80"
                ),
                List.of(
                    variant("TAN-007-IVY-XS", "XS", "Ivory",     "490.00"),
                    variant("TAN-007-IVY-S",  "S",  "Ivory",     "490.00"),
                    variant("TAN-007-IVY-M",  "M",  "Ivory",     "490.00"),
                    variant("TAN-007-NOI-S",  "S",  "Noir",      "490.00"),
                    variant("TAN-007-NOI-M",  "M",  "Noir",      "490.00"),
                    variant("TAN-007-CHP-M",  "M",  "Champagne", "490.00"),
                    variant("TAN-007-SGE-M",  "M",  "Sage",      "490.00")
                ));
        inv(7L,"TAN-007-IVY-XS","Cashmere Ribbed Turtleneck","XS","Ivory","TAN-PARIS-WH","WAREHOUSE","EU",8,2);
        inv(7L,"TAN-007-IVY-S", "Cashmere Ribbed Turtleneck","S", "Ivory","TAN-PARIS-WH","WAREHOUSE","EU",14,3);
        inv(7L,"TAN-007-IVY-M", "Cashmere Ribbed Turtleneck","M", "Ivory","TAN-NYC-WH","WAREHOUSE","US",12,3);
        inv(7L,"TAN-007-NOI-S", "Cashmere Ribbed Turtleneck","S", "Noir","TAN-PARIS-WH","WAREHOUSE","EU",10,3);
        inv(7L,"TAN-007-NOI-M", "Cashmere Ribbed Turtleneck","M", "Noir","TAN-NYC-WH","WAREHOUSE","US",11,3);
        inv(7L,"TAN-007-CHP-M", "Cashmere Ribbed Turtleneck","M", "Champagne","TAN-LONDON-WH","WAREHOUSE","UK",9,2);
        inv(7L,"TAN-007-SGE-M", "Cashmere Ribbed Turtleneck","M", "Sage","TAN-PARIS-WH","WAREHOUSE","EU",7,2);

        // 8. Noir Tapered Tailored Trousers
        seedProduct(8L, "TAN-008", 2L,
                "Noir Tapered Tailored Trousers",
                "Precision-tailored in Japanese wool-crêpe with a tapered leg and invisible side seam. The definitive TANTA trouser.",
                "trousers", "tailored", "tapered", "Japanese Wool Crêpe",
                List.of(
                    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1506629905607-d9c36e0a0b14?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80"
                ),
                List.of(
                    variant("TAN-008-NOI-XS", "XS", "Noir",  "440.00"),
                    variant("TAN-008-NOI-S",  "S",  "Noir",  "440.00"),
                    variant("TAN-008-NOI-M",  "M",  "Noir",  "440.00"),
                    variant("TAN-008-NOI-L",  "L",  "Noir",  "440.00"),
                    variant("TAN-008-CHC-S",  "S",  "Charcoal","440.00"),
                    variant("TAN-008-CHC-M",  "M",  "Charcoal","440.00")
                ));
        inv(8L,"TAN-008-NOI-XS","Noir Tapered Tailored Trousers","XS","Noir","TAN-PARIS-WH","WAREHOUSE","EU",7,2);
        inv(8L,"TAN-008-NOI-S", "Noir Tapered Tailored Trousers","S", "Noir","TAN-PARIS-WH","WAREHOUSE","EU",13,3);
        inv(8L,"TAN-008-NOI-M", "Noir Tapered Tailored Trousers","M", "Noir","TAN-NYC-WH","WAREHOUSE","US",14,3);
        inv(8L,"TAN-008-NOI-L", "Noir Tapered Tailored Trousers","L", "Noir","TAN-LONDON-WH","WAREHOUSE","UK",8,2);
        inv(8L,"TAN-008-CHC-S", "Noir Tapered Tailored Trousers","S", "Charcoal","TAN-PARIS-WH","WAREHOUSE","EU",9,3);
        inv(8L,"TAN-008-CHC-M", "Noir Tapered Tailored Trousers","M", "Charcoal","TAN-NYC-WH","WAREHOUSE","US",10,3);

        // 9. Ivory Merino Midi Skirt
        seedProduct(9L, "TAN-009", 1L,
                "Ivory Merino Midi Skirt",
                "Bias-cut in extra-fine merino jersey. Falls effortlessly to the mid-calf with a clean hem and invisible back zip.",
                "skirts", "midi", "slim", "Extra-Fine Merino",
                List.of(
                    "https://images.unsplash.com/photo-1594938298603-c8148c4b3bea?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80"
                ),
                List.of(
                    variant("TAN-009-IVY-XS", "XS", "Ivory",     "380.00"),
                    variant("TAN-009-IVY-S",  "S",  "Ivory",     "380.00"),
                    variant("TAN-009-IVY-M",  "M",  "Ivory",     "380.00"),
                    variant("TAN-009-IVY-L",  "L",  "Ivory",     "380.00"),
                    variant("TAN-009-TAU-S",  "S",  "Taupe",     "380.00"),
                    variant("TAN-009-TAU-M",  "M",  "Taupe",     "380.00")
                ));
        inv(9L,"TAN-009-IVY-XS","Ivory Merino Midi Skirt","XS","Ivory","TAN-PARIS-WH","WAREHOUSE","EU",9,2);
        inv(9L,"TAN-009-IVY-S", "Ivory Merino Midi Skirt","S", "Ivory","TAN-PARIS-WH","WAREHOUSE","EU",15,3);
        inv(9L,"TAN-009-IVY-M", "Ivory Merino Midi Skirt","M", "Ivory","TAN-NYC-WH","WAREHOUSE","US",14,3);
        inv(9L,"TAN-009-IVY-L", "Ivory Merino Midi Skirt","L", "Ivory","TAN-LONDON-WH","WAREHOUSE","UK",8,2);
        inv(9L,"TAN-009-TAU-S", "Ivory Merino Midi Skirt","S", "Taupe","TAN-PARIS-WH","WAREHOUSE","EU",10,3);
        inv(9L,"TAN-009-TAU-M", "Ivory Merino Midi Skirt","M", "Taupe","TAN-NYC-WH","WAREHOUSE","US",9,2);

        // 10. Suede Chelsea Boot
        seedProduct(10L, "TAN-010", 3L,
                "Suede Chelsea Boot",
                "Hand-lasted in Spain from aniline suede. The Chelsea silhouette refined — a low stacked heel, elastic gussets, and a leather sock lining.",
                "footwear", "boots", "regular", "Aniline Suede",
                List.of(
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80",
                    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&q=80"
                ),
                List.of(
                    variant("TAN-010-TAU-36", "36", "Taupe",  "620.00"),
                    variant("TAN-010-TAU-37", "37", "Taupe",  "620.00"),
                    variant("TAN-010-TAU-38", "38", "Taupe",  "620.00"),
                    variant("TAN-010-TAU-39", "39", "Taupe",  "620.00"),
                    variant("TAN-010-NOI-37", "37", "Noir",   "620.00"),
                    variant("TAN-010-NOI-38", "38", "Noir",   "620.00"),
                    variant("TAN-010-NOI-39", "39", "Noir",   "620.00")
                ));
        inv(10L,"TAN-010-TAU-36","Suede Chelsea Boot","36","Taupe","TAN-PARIS-WH","WAREHOUSE","EU",5,2);
        inv(10L,"TAN-010-TAU-37","Suede Chelsea Boot","37","Taupe","TAN-PARIS-WH","WAREHOUSE","EU",8,2);
        inv(10L,"TAN-010-TAU-38","Suede Chelsea Boot","38","Taupe","TAN-NYC-WH","WAREHOUSE","US",7,2);
        inv(10L,"TAN-010-TAU-39","Suede Chelsea Boot","39","Taupe","TAN-LONDON-WH","WAREHOUSE","UK",5,2);
        inv(10L,"TAN-010-NOI-37","Suede Chelsea Boot","37","Noir","TAN-PARIS-WH","WAREHOUSE","EU",7,2);
        inv(10L,"TAN-010-NOI-38","Suede Chelsea Boot","38","Noir","TAN-NYC-WH","WAREHOUSE","US",9,2);
        inv(10L,"TAN-010-NOI-39","Suede Chelsea Boot","39","Noir","TAN-LONDON-WH","WAREHOUSE","UK",6,2);

        // Ensure sequence counters are correct
        sequenceService.ensureAtLeast("collections",  3L);
        sequenceService.ensureAtLeast("products",    10L);
        sequenceService.ensureAtLeast("users",         1L);
        sequenceService.ensureAtLeast("cart_items",    0L);
        sequenceService.ensureAtLeast("wishlist_items",0L);
        sequenceService.ensureAtLeast("orders",        0L);
        sequenceService.ensureAtLeast("order_items",   0L);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Admin seed
    // ─────────────────────────────────────────────────────────────────────────

    private void seedAdminIfMissing() {
        if (mongoTemplate.exists(
                Query.query(Criteria.where("email").is("admin@tanta.fashion")),
                UserDocument.class)) {
            return;
        }
        mongoTemplate.save(new UserDocument(
                1L,
                "TANTA Admin",
                "admin@tanta.fashion",
                credentialHashService.hash("Lumiere#2026"),
                List.of("ADMIN", "INVENTORY_MANAGER"),
                "GLOBAL",
                LocalDateTime.now()
        ));
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private void seedProduct(Long id, String sku, Long collectionId, String name, String description,
                             String category, String subcategory, String fit, String fabric,
                             List<String> images, List<ProductVariantDocument> variants) {
        BigDecimal basePrice = variants.stream()
                .map(ProductVariantDocument::getPrice)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        mongoTemplate.save(new ProductDocument(
                id, sku, collectionId, name, description, basePrice,
                category, subcategory, fit, fabric, "ACTIVE",
                variants.stream().map(ProductVariantDocument::getColor).distinct().toList(),
                variants.stream().map(ProductVariantDocument::getSize).distinct().toList(),
                images,
                List.of("EU", "US", "UK"),
                variants,
                LocalDateTime.now(), LocalDateTime.now()
        ));
    }

    private ProductVariantDocument variant(String sku, String size, String color, String price) {
        return new ProductVariantDocument(sku, size, color, new BigDecimal(price));
    }

    private void inv(Long productId, String sku, String productName, String size, String color,
                     String locationCode, String locationType, String region, int available, int threshold) {
        mongoTemplate.save(new InventoryDocument(
                invId(productId, size, color, locationCode),
                productId, sku, productName, size, color,
                locationCode, locationType, region,
                available, 0, 0, threshold, LocalDateTime.now()
        ));
    }

    private String invId(Long productId, String size, String color, String loc) {
        return productId + ":" + size + "|" + color + ":" + loc;
    }
}
