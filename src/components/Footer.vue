<template>
  <footer class="bg-dark text-light footer mt-auto">
    <div class="container-fluid px-0">
      <div class="container py-5">
        <div class="row g-5">
          <div class="col-lg-3 col-md-6">
            <h4 class="text-white mb-3">Quick Link</h4>
            <a class="footer-quick-link" href="">
              <i class="fa fa-chevron-right me-2"></i>About Us
            </a>
            <a class="footer-quick-link" href="">
              <i class="fa fa-chevron-right me-2"></i>Contact Us
            </a>
            <a class="footer-quick-link" href="">
              <i class="fa fa-chevron-right me-2"></i>Privacy Policy
            </a>
            <a class="footer-quick-link" href="">
              <i class="fa fa-chevron-right me-2"></i>Terms & Condition
            </a>
            <a class="footer-quick-link" href="">
              <i class="fa fa-chevron-right me-2"></i>FAQs & Help
            </a>
          </div>
          <div class="col-lg-3 col-md-6">
            <h4 class="text-white mb-3">Contact</h4>
            <p class="mb-2"><i class="fa fa-map-marker-alt me-3"></i>123 Street, New York, USA</p>
            <p class="mb-2"><i class="fa fa-phone-alt me-3"></i>+012 345 67890</p>
            <p class="mb-2"><i class="fa fa-envelope me-3"></i>info@example.com</p>
            <div class="d-flex pt-2">
              <a class="btn btn-outline-light btn-social" href=""><i class="fab fa-twitter"></i></a>
              <a class="btn btn-outline-light btn-social" href=""><i class="fab fa-facebook-f"></i></a>
              <a class="btn btn-outline-light btn-social" href=""><i class="fab fa-youtube"></i></a>
              <a class="btn btn-outline-light btn-social" href=""><i class="fab fa-linkedin-in"></i></a>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <h4 class="text-white mb-3">Gallery</h4>
            <div class="row g-2 pt-2">
              <div class="col-4">
                <img class="img-fluid rounded" src="/img/course-1.jpg" alt="">
              </div>
              <div class="col-4">
                <img class="img-fluid rounded" src="/img/course-2.jpg" alt="">
              </div>
              <div class="col-4">
                <img class="img-fluid rounded" src="/img/course-3.jpg" alt="">
              </div>
              <div class="col-4">
                <img class="img-fluid rounded" src="/img/course-1.jpg" alt="">
              </div>
              <div class="col-4">
                <img class="img-fluid rounded" src="/img/course-2.jpg" alt="">
              </div>
              <div class="col-4">
                <img class="img-fluid rounded" src="/img/course-3.jpg" alt="">
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <h4 class="text-white mb-3">Newsletter</h4>
            <p>Dolor amet sit justo amet elitr clita ipsum elitr est.</p>
            <div class="position-relative mx-auto" style="max-width: 400px;">
              <input class="form-control border-0 w-100 py-3 ps-4 pe-5" type="text" placeholder="Your email">
              <button type="button" class="btn btn-primary py-2 position-absolute top-0 end-0 me-2" style="margin-top: 3px;">
                SignUp
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="container">
        <div class="copyright">
          <div class="row">
            <div class="col-md-6 text-center text-md-start mb-3 mb-md-0">
              &copy; <a class="border-bottom" href="#">Your Site Name</a>, All Right Reserved.
            </div>
            <div class="col-md-6 text-center text-md-end">
              <div class="footer-menu">
                <a href="">Home</a>
                <a href="">Cookies</a>
                <a href="">Help</a>
                <a href="">FQAs</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// Footer component
</script>

<style scoped>
footer {
  width: 100%;
  margin-top: auto;
}

.footer {
  overflow-x: hidden;
}

.footer .container-fluid {
  width: 100%;
  max-width: 100%;
}

.footer .copyright {
  padding: 25px 0;
  font-size: 15px;
  border-top: 1px solid rgba(256, 256, 256, .1);
}

.footer .copyright a {
  color: var(--light);
}

.footer .footer-menu a {
  margin-right: 15px;
  padding-right: 15px;
  border-right: 1px solid rgba(256, 256, 256, .1);
}

.footer .footer-menu a:last-child {
  margin-right: 0;
  padding-right: 0;
  border-right: none;
}

.footer-quick-link {
  display: block;
  width: 100%;
  background-color: transparent;
  color: #fff !important;
  padding: 10px 15px;
  margin-bottom: 2px;
  text-decoration: none;
  font-size: 15px;
  transition: all 0.3s;
  border-radius: 0;
}

.footer-quick-link:hover {
  background-color: transparent;
  color: #fb873f !important;
  transform: translateX(5px);
}

.footer-quick-link i {
  color: #fff;
  font-size: 12px;
}

@media (max-width: 768px) {
  .footer .row {
    margin: 0;
  }
  
  .footer .col-lg-3,
  .footer .col-md-6 {
    margin-bottom: 2rem;
  }
  
  .footer .copyright .row {
    flex-direction: column;
    text-align: center !important;
  }
  
  .footer .footer-menu {
    margin-top: 1rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }
  
  .footer .footer-menu a {
    border-right: none;
    padding-right: 0;
    margin-right: 0;
  }
}
</style>

