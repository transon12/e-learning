<template>
  <footer class="bg-dark text-light footer mt-auto">
    <div class="container-fluid px-0">
      <div class="container">
        <div class="copyright">
          <div class="row">
            <div class="col-md-6 text-center text-md-start mb-3 mb-md-0">
              &copy; <a class="border-bottom" href="#">E-Learning</a>, All Right Reserved.
            </div>
            <div class="col-md-6 text-center text-md-end">
              <div class="footer-menu">
                <a href="">Home</a>
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

