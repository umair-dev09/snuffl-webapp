#!/usr/bin/env node

const testRailwayEnhancedScraping = async () => {
    // Get Railway URL from environment or use default
    const railwayUrl = process.env.RAILWAY_CRAWL4AI_URL || 'https://your-railway-url.railway.app';
    const testUrl = "https://www.google.com/shopping/product/8888808767729539515?gl=in";
    
    console.log("🚂 Testing Enhanced Google Shopping Scraping on Railway...");
    console.log(`🔗 Railway URL: ${railwayUrl}`);
    console.log(`📱 Test URL: ${testUrl}`);
    
    // Test health check first
    console.log("\n🏥 Testing health check...");
    try {
        const response = await fetch(`${railwayUrl}/health`);
        const result = await response.json();
        console.log("✅ Health check:", result);
    } catch (error) {
        console.error("❌ Health check failed:", error.message);
        return;
    }
    
    // Test comprehensive Google Shopping scraping
    console.log("\n🛍️ Testing comprehensive Google Shopping scraping...");
    const startTime = Date.now();
    
    try {
        const response = await fetch(`${railwayUrl}/scrape-google-shopping`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: testUrl,
                extract_structured_data: true
            })
        });
        
        const result = await response.json();
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        
        console.log(`⏱️ Scraping took: ${duration.toFixed(2)} seconds`);
        
        if (result.success && result.product_data) {
            const data = result.product_data;
            console.log("\n📊 Extracted Data Summary:");
            console.log(`🏷️ Title: ${data.title || 'Not extracted'}`);
            console.log(`🏭 Brand: ${data.brand || 'Not extracted'}`);
            console.log(`💰 Price: ${data.price || 'Not extracted'}`);
            console.log(`🎨 Price Range: ${data.price_range || 'Not extracted'}`);
            console.log(`🖼️ Images: ${data.image_urls?.length || 0} images`);
            console.log(`📝 Description: ${data.description ? 'Available' : 'Not extracted'}`);
            console.log(`⚡ Features: ${data.features?.length || 0} features`);
            console.log(`🌈 Colors: ${data.colors_available?.length || 0} colors`);
            console.log(`📐 Sizes: ${data.sizes_available?.length || 0} sizes`);
            console.log(`📊 Specifications: ${data.specifications ? Object.keys(data.specifications).length : 0} specs`);
            console.log(`⚖️ Weight: ${data.weight || 'Not extracted'}`);
            console.log(`📏 Dimensions: ${data.dimensions || 'Not extracted'}`);
            console.log(`📦 Availability: ${data.availability_text || 'Not extracted'}`);
            console.log(`🛒 Buying Options: ${data.buying_options?.length || 0} options`);
            console.log(`⭐ Average Rating: ${data.average_rating || 'Not extracted'}`);
            console.log(`📋 Total Reviews: ${data.total_reviews || 'Not extracted'}`);
            console.log(`🏷️ Review Tags: ${data.review_tags?.length || 0} tags`);
            console.log(`💬 Sample Reviews: ${data.sample_reviews?.length || 0} sample reviews`);
            
            // Show detailed buying options if available
            if (data.buying_options?.length > 0) {
                console.log("\n🛒 Buying Options Details:");
                data.buying_options.forEach((option, index) => {
                    console.log(`  ${index + 1}. ${option.seller_name || 'Unknown'} - ₹${option.price || 'N/A'}`);
                    if (option.delivery_info) console.log(`     📦 ${option.delivery_info}`);
                    if (option.offers) console.log(`     🎁 ${option.offers}`);
                });
            }
            
            // Show sample reviews if available
            if (data.sample_reviews?.length > 0) {
                console.log("\n💬 Sample Reviews:");
                data.sample_reviews.forEach((review, index) => {
                    console.log(`  ${index + 1}. ⭐${review.rating} - ${review.source || 'Unknown'}`);
                    console.log(`     "${review.review_text || 'No text'}"`);
                });
            }
            
        } else {
            console.log("❌ Scraping failed:", result.error || 'Unknown error');
        }
        
    } catch (error) {
        console.error("❌ Comprehensive scraping failed:", error.message);
    }
};

// Run the test
testRailwayEnhancedScraping();
