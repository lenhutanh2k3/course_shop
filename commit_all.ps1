git commit -m "feat(frontend): setup core authentication, routing and main layout components"
git checkout feature/frontend-auth
git checkout -b feature/backend-user
git add backend/app/Http/Controllers/UserController.php backend/app/Http/Controllers/DashboardController.php backend/app/Http/Resources/UserResource.php backend/app/Models/User.php backend/database/migrations/2026_02_24_134229_add_avatar_to_users_table.php backend/database/migrations/2026_02_24_141005_alter_users_table_add_status_and_soft_deletes.php backend/database/migrations/2026_02_24_144345_create_wishlists_table.php backend/database/seeders/AdminUserSeeder.php
git commit -m "feat(backend): add user, profile, wishlist, and dashboard APIs"

git checkout feature/backend-user
git checkout -b feature/backend-payment
git add backend/app/Http/Controllers/CheckoutController.php backend/app/Http/Controllers/OrderController.php backend/app/Http/Controllers/CartController.php backend/app/Models/Order.php backend/app/Models/OrderItem.php backend/app/Services/ backend/database/migrations/2026_02_24_000000_create_orders_table.php backend/database/migrations/2026_02_24_000001_create_order_items_table.php backend/app/Mail/ backend/resources/views/emails/ backend/app/Http/Middleware/
git commit -m "feat(backend): implement vnpay checkout, cart, and email services"

git checkout feature/backend-payment
git checkout -b feature/backend-core
git add backend/app/Http/Controllers/CourseController.php backend/app/Http/Requests/StoreCourseRequest.php backend/app/Http/Requests/UpdateCourseRequest.php backend/app/Http/Resources/CourseCollection.php backend/app/Models/Course.php backend/bootstrap/app.php backend/routes/api.php backend/routes/web.php
git commit -m "feat(backend): update course APIs and routing"

git checkout feature/backend-core
git checkout -b feature/frontend-user
git add frontend/src/pages/Profile.tsx frontend/src/pages/Wishlist.tsx frontend/src/pages/OrderHistory.tsx frontend/src/pages/admin/
git commit -m "feat(frontend): implement profile, wishlist, order history pages, and fix admin avatar"

git checkout feature/frontend-user
git checkout -b feature/frontend-payment
git add frontend/src/pages/Cart.tsx frontend/src/pages/Checkout.tsx
git commit -m "feat(frontend): create cart interface and VNPay checkout integration"

git checkout feature/frontend-payment
git checkout -b feature/frontend-ui-compact
git add frontend/src/pages/ frontend/src/components/
git commit -m "ui(frontend): enhance responsive design and apply compact UI sizes"
