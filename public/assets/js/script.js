
document.addEventListener("DOMContentLoaded", function() {
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 800,
      once: true
    });
  }
});

//user-client
const buttonUser = document.querySelector(".inner-user-cart .inner-user")
if(buttonUser){
  var checkUser = false;
  fetch("/api/auth/verify",{
    method:"POST",
    headers:{
      "Content-type":"application/json"
    },
  })
  .then(res=>res.json())
  .then(data=>{
    if(data.code=="success"){
      checkUser=true;
    }else{
      checkUser = false;
    }
  })
  const itemUser = buttonUser.querySelector(".inner-user-unsuccess")
  const itemUserSuccess = buttonUser.querySelector(".inner-user-success")
  buttonUser.addEventListener("click", (e) => {
    e.stopPropagation();
    if(checkUser) itemUserSuccess.classList.add("active");
    else itemUser.classList.add("active");
  })

  document.addEventListener("click", () => {
    itemUserSuccess.classList.remove("active");
    itemUser.classList.remove("active");
  })
}
//end user-client
// Login Form
const loginForm = document.querySelector("#login-form");
if(loginForm) {
  const validation = new JustValidate('#login-form');

  validation
    .addField('#email', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập email của bạn!',
      },
      {
        rule: 'email',
        errorMessage: 'Email không đúng định dạng!',
      },
    ])
    .addField('#password', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập mật khẩu!',
      },
      {
        validator: (value) => value.length >= 8,
        errorMessage: 'Mật khẩu phải chứa ít nhất 8 ký tự!',
      },
      {
        validator: (value) => /[A-Z]/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ cái in hoa!',
      },
      {
        validator: (value) => /[a-z]/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ cái thường!',
      },
      {
        validator: (value) => /\d/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ số!',
      },
      {
        validator: (value) => /[@$!%*?&]/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt!',
      },
    ])
    .onSuccess((event) => {
      const email = event.target.email.value;
      const password = event.target.password.value;
      const rememberPassword = event.target.rememberPassword.checked;
      const dataFinal = {
        email:email,
        password:password,
      };
      fetch(`/account/login`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify(dataFinal)
      })
      .then(res=>res.json())
      .then(data=>{
        if(data.code=="error"){
          alert(data.message);
        }
        else{
          window.location.href=`/`;
        }
      })
    })
  ;
}
// End Login Form

// Register Form
const registerForm = document.querySelector("#register-form");
if(registerForm) {
  const validation = new JustValidate('#register-form');

  validation
    .addField('#fullName', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập họ tên!'
      },
      {
        rule: 'minLength',
        value: 5,
        errorMessage: 'Họ tên phải có ít nhất 5 ký tự!',
      },
      {
        rule: 'maxLength',
        value: 50,
        errorMessage: 'Họ tên không được vượt quá 50 ký tự!',
      },
    ])
    .addField('#email', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập email của bạn!',
      },
      {
        rule: 'email',
        errorMessage: 'Email không đúng định dạng!',
      },
    ])
    .addField('#password', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập mật khẩu!',
      },
      {
        validator: (value) => value.length >= 8,
        errorMessage: 'Mật khẩu phải chứa ít nhất 8 ký tự!',
      },
      {
        validator: (value) => /[A-Z]/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ cái in hoa!',
      },
      {
        validator: (value) => /[a-z]/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ cái thường!',
      },
      {
        validator: (value) => /\d/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ số!',
      },
      {
        validator: (value) => /[@$!%*?&]/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt!',
      },
    ])
    .addField('#confirm-Password', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng xác nhận mật khẩu!',
      },
      {
        validator: (value, fields) => {
          const passwordValue = fields['#password'].elem.value;
          return value === passwordValue;
        },
        errorMessage: 'Mật khẩu xác nhận không khớp!',
      },
    ])
    .addField('#agree', [
      {
        rule: 'required',
        errorMessage: 'Bạn phải đồng ý với các điều khoản và điều kiện!',
      },
    ])
    .onSuccess((event) => {
      const fullName = event.target.fullName.value;
      const email = event.target.email.value;
      const password = event.target.password.value;
      const dataFinal = {
        fullName: fullName,
        email: email,
        password: password
      };
      fetch(`/account/register`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify(dataFinal)
      })
      .then(res=>res.json())
      .then(data=>{
        if(data.code=="error"){
          alert(data.message)
        }
        else{
          window.location.href= `/account/login`
        }
      })
    })
  ;
}
// End Register Form

// Forgot Password Form
const forgotPasswordForm = document.querySelector("#forgot-password-form");
if(forgotPasswordForm) {
  const validation = new JustValidate('#forgot-password-form');

  validation
    .addField('#email', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập email của bạn!',
      },
      {
        rule: 'email',
        errorMessage: 'Email không đúng định dạng!',
      },
    ])
    .onSuccess((event) => {
      const email = event.target.email.value;
      const dataFinal = {
        email:email
      }
      fetch(`/account/forgot-password`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify(dataFinal)
      })
      .then(res=>res.json())
      .then(data=>{
        if(data.code=="error"){
          alert(data.message)
        }
        else{
          window.location.href=`/account/otp-password?email=${email}`
        }
      })
    })
  ;
}
// End Forgot Password Form

// OTP Password Form
const otpPasswordForm = document.querySelector("#otp-password-form");
if(otpPasswordForm) {
  const validation = new JustValidate('#otp-password-form');

  validation
    .addField('#otp', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập mã OTP!',
      },
    ])
    .onSuccess((event) => {
      const otp = event.target.otp.value;
      const ulrParams = new URLSearchParams(window.location.search)
      const email = ulrParams.get("email")
      const dataFinal = {
        otp:otp,
        email:email
      }
      console.log(dataFinal)
      fetch(`/account/otp-password`,{
        method:"POST",
        headers:{
          "Content-type":"application/json"
        },
        body: JSON.stringify(dataFinal)
      })
      .then(res => res.json())
      .then(data=>{
        if(data.code=="error")
          alert(data.message)
        else
          window.location.href=`/account/reset-password`
      })
    })
  ;
}
// End OTP Password Form

// Reset Password Form
const resetPasswordForm = document.querySelector("#reset-password-form");
if(resetPasswordForm) {
  const validation = new JustValidate('#reset-password-form');

  validation
    .addField('#password', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập mật khẩu!',
      },
      {
        validator: (value) => value.length >= 8,
        errorMessage: 'Mật khẩu phải chứa ít nhất 8 ký tự!',
      },
      {
        validator: (value) => /[A-Z]/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ cái in hoa!',
      },
      {
        validator: (value) => /[a-z]/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ cái thường!',
      },
      {
        validator: (value) => /\d/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ số!',
      },
      {
        validator: (value) => /[@$!%*?&]/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt!',
      },
    ])
    .addField('#confirm-password', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng xác nhận mật khẩu!',
      },
      {
        validator: (value, fields) => {
          const password = fields['#password'].elem.value;
          return value == password;
        },
        errorMessage: 'Mật khẩu xác nhận không khớp!',
      }
    ])
    .onSuccess((event) => {
      const password = event.target.password.value;
      const dataFinal = {
        password:password
      }
      fetch(`/account/reset-password`,{
        method:"POST",
        headers:{
          "Content-type":"application/json"
        },
        body: JSON.stringify(dataFinal)
      })
      .then(res=>res.json())
      .then(data=>{
        if(data.code=="error"){
          alert(data.message)
        }
        else{
          window.location.href= `/`
        }
      })
    })
  ;
}
// End Reset Password Form

// Menu Mobile
const buttonMenuMobile = document.querySelector(".header .inner-menu-mobile");
if(buttonMenuMobile) {
  const menu = document.querySelector(".header .inner-menu");

  // Click vào button mở menu
  buttonMenuMobile.addEventListener("click", () => {
    menu.classList.add("active");
  });

  // Click vào overlay đóng menu
  const overlay = menu.querySelector(".inner-overlay");
  if(overlay) {
    overlay.addEventListener("click", () => {
      menu.classList.remove("active");
    });
  }

  // Click vào icon down mở sub menu
  const listButtonSubMenu = menu.querySelectorAll("ul > li > i");
  listButtonSubMenu.forEach(button => {
    button.addEventListener("click", () => {
      button.parentNode.classList.toggle("active");
    })
  });
}
// End Menu Mobile

// Box Address Section 1
const boxAddressSection1 = document.querySelector(".section-1 .inner-form .inner-box.inner-address");
if(boxAddressSection1) {
  // Ẩn/hiện box suggest
  const input = boxAddressSection1.querySelector(".inner-input");

  input.addEventListener("focus", () => {
    boxAddressSection1.classList.add("active");
  })

  input.addEventListener("blur", () => {
    boxAddressSection1.classList.remove("active");
  })

  // Sự kiện click vào từng item
  const listItem = boxAddressSection1.querySelectorAll(".inner-suggest-list .inner-item");
  listItem.forEach(item => {
    item.addEventListener("mousedown", () => {
      const title = item.querySelector(".inner-item-title").innerHTML.trim();
      if(title) {
        input.value = title;
      }
    })
  })
}
// End Box Address Section 1


// Box Filter
const buttonFilterMobile = document.querySelector(".section-9 .inner-filter-mobile");
if(buttonFilterMobile) {
  const boxLeft = document.querySelector(".section-9 .inner-left");
  buttonFilterMobile.addEventListener("click", () => {
    boxLeft.classList.add("active");
  })

  const overlay = document.querySelector(".section-9 .inner-left .inner-overlay");
  overlay.addEventListener("click", () => {
    boxLeft.classList.remove("active");
  })
}
// End Box Filter

// Box Tour Info
const boxTourInfo = document.querySelector(".box-tour-info");
if(boxTourInfo) {
  const buttonReadMore = boxTourInfo.querySelector(".inner-read-more button");
  buttonReadMore.addEventListener("click", () => {
    boxTourInfo.classList.add("active");
  })

  new Viewer(boxTourInfo);
}
// End Box Tour Info


// Swiper Section 2
const swiperSection2 = document.querySelector(".swiper-section-2");
if(swiperSection2) {
  new Swiper('.swiper-section-2', {
    slidesPerView: 1,
    spaceBetween: 20,
    autoplay: {
      delay: 4000,
    },
    loop: true,
    breakpoints: {
      992: {
        slidesPerView: 2,
      },
      1200: {
        slidesPerView: 3,
      },
    },
  });
}
// End Swiper Section 2

// Swiper Section 3
const swiperSection3 = document.querySelector(".swiper-section-3");
if(swiperSection3) {
  new Swiper('.swiper-section-3', {
    slidesPerView: 1,
    spaceBetween: 20,
    autoplay: {
      delay: 4000,
    },
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    breakpoints: {
      576: {
        slidesPerView: 2,
      },
      992: {
        slidesPerView: 3,
      },
    },
  });
}
// End Swiper Section 3

// Swiper Box Images
const boxImages = document.querySelector(".box-images");
if(boxImages) {
  const swiperBoxImagesThumb = new Swiper(".swiper-box-images-thumb", {
    spaceBetween: 5,
    slidesPerView: 4,
    breakpoints: {
      576: {
        spaceBetween: 10,
      },
    },
  });

  const swiperBoxImagesMain = new Swiper(".swiper-box-images-main", {
    spaceBetween: 0,
    thumbs: {
      swiper: swiperBoxImagesThumb,
    },
  });
}
// End Swiper Box Images

// Zoom Box Images Main
const boxImagesMain = document.querySelector(".box-images .inner-images-main");
if(boxImagesMain) {
  new Viewer(boxImagesMain);
}
// End Zoom Box Images Main

// Box Tour Schedule
const boxTourSchedule = document.querySelector(".box-tour-schedule");
if(boxTourSchedule) {
  new Viewer(boxTourSchedule);
}
// End Box Tour Schedule
// Email Form
const emailForm = document.querySelector("#email-form");
if(emailForm) {
  const validation = new JustValidate('#email-form');

  validation
    .addField('#email-input', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập email của bạn!',
      },
      {
        rule: 'email',
        errorMessage: 'Email không đúng định dạng!',
      },
    ])
    .onSuccess((event) => {
      const email = event.target.email.value;
      const dataFinal = {
        email:email
      }

      fetch(`/contact`,{
        method:"POST",
        headers:{
          "Content-type":"application/json"
        },
        body:JSON.stringify(dataFinal)
      })
      .then(res=>res.json())
      .then(data=>{
        if(data.code=="error"){
          Swal.fire({
            icon: 'error',
            title: 'Thất bại!',
            text: 'Email này đã được đăng ký!',
            timer: 3000,
            showConfirmButton: false
          });
        }
        else{
          window.location.reload()
        }
      })
    })
  ;
}
// End Email Form

// Coupon Form
const couponForm = document.querySelector("#coupon-form");
if(couponForm) {
  const validation = new JustValidate('#coupon-form');

  validation
    .onSuccess((event) => {
      const coupon = event.target.coupon.value;
      console.log(coupon);
    })
  ;
}

///-----------book----------
//asc button
const buttonAsc = document.querySelector("[button-asc]")
if(buttonAsc){
  const url = new URL(window.location.href)
  buttonAsc.addEventListener("click",()=>{
    url.searchParams.delete("sort")
    url.searchParams.set("sort",buttonAsc.value)
    window.location.href = url.href
  })

}
//desc button
const buttonDesc = document.querySelector("[button-desc]")
if(buttonAsc){
  const url = new URL(window.location.href)
  buttonDesc.addEventListener("click",()=>{
    url.searchParams.delete("sort")
    url.searchParams.set("sort",buttonDesc.value)
    window.location.href = url.href
  })

}
//filter-price
const filterPrice = document.querySelector("[filter-price]")
if(filterPrice){
  const url = new URL(window.location.href)
  // const selectCategory  = filterPrice.querySelector("[category]")
  const selectPrice = filterPrice.querySelector("[price]")
  const button = filterPrice.querySelector("[excute]")
  const buttonClear = filterPrice.querySelector("[clear]")
  if(button){
    button.addEventListener("click",()=>{
      if(selectPrice.value){
        // url.searchParams.set("category",selectCategory.value)
        url.searchParams.set("price",selectPrice.value)
      }
      else{
        // url.searchParams.delete("category")
        url.searchParams.delete("price")
      }
      window.location.href = url.href
    })
    // const currentCategory = url.searchParams.get("category")
    // if(currentCategory) selectCategory.value =currentCategory
    const currentPrice = url.searchParams.get("price")
    if(currentPrice) selectPrice.value =currentPrice
  }
  if(buttonClear){
    buttonClear.addEventListener("click",()=>{
      url.search= ""
      window.location.href = url.href
    })
  }
}
//end filter-price

//box-pagination
const boxPagination = document.querySelector("[box-pagination]")
if(boxPagination){
  const url = new URL(window.location.href)
  const buttons = boxPagination.querySelectorAll("button")
  buttons.forEach(button => {
    button.addEventListener("click",()=>{
      const page = button.getAttribute("page")
      url.searchParams.set("page",page)
      window.location.href = url.href
    })
    const current = url.searchParams.get("page")
    if(current){
      buttons.forEach(btn =>btn.classList.remove("active"));
      buttons.forEach(btn =>{
        if(btn.getAttribute("page")==current){
          btn.classList.add("active")
        }
      });
    }
  });
}
//End box-pagination
///End -----------book----------

// Alert
const alertTime = document.querySelector("[alert-time]");
if(alertTime) {
  let time = alertTime.getAttribute("alert-time");
  time = time ? parseInt(time) : 4000;
  setTimeout(() => {
    alertTime.remove(); 
  }, time);
}
// End Alert

//find Book
const findBook = document.querySelector("[find-book]")
if(findBook){
  const url = new URL(`${window.location.href}search`)
  findBook.addEventListener("keyup",(event)=>{
    if(event.code=="Enter"){
      if(findBook.value){
        url.searchParams.set("keyword",findBook.value)
      }
      else{
        url.searchParams.delete("keyword")
      }
      window.location.href = url.href
    }
  })
}
//End find Book

//detail - book
const numberDetail = document.querySelector("[number-detail]");
if (numberDetail) {
  numberDetail.addEventListener("input", (event) => {
    let value = event.target.value.replace(/[^0-9]/g, "");
    if (value !== "") {
      let number = parseInt(value, 10);
      if (number <= 0) {
        number = 1;
      }
      const stock = document.querySelector("[stock]");
      const valueStock = parseInt(stock.getAttribute("stock"));
      if (number > valueStock) {
        number = valueStock;
      }
      value = number.toString();
    }
    event.target.value = value;
  });
  numberDetail.addEventListener("change", () => {
    const number = document.querySelector("[number]");
    number.innerHTML = numberDetail.value;

    const priceBook = document.querySelector("[priceBook]");
    const totalPrice = document.querySelector("[totalPrice]");
    totalPrice.innerHTML = (
      parseInt(numberDetail.value) * parseInt(priceBook.getAttribute("priceBook"))
    ).toLocaleString("vi-VN");
  });
}

const bookDetail = document.querySelector("[book-detail]")
if(bookDetail){
  const btn = bookDetail.querySelector("[idBook]")
  btn.addEventListener("click",()=>{
    const idBook = btn.getAttribute("idBook")
    const input = bookDetail.querySelector("[number-detail]")
    const id_user = document.querySelector("[id_user]")
    const valueIdUser = id_user.getAttribute("id_user")
    const numberBook = input.value
    const dataFinal ={
      id_book:idBook,
      numberBook,
      id_user:valueIdUser,
      checkItem:false                                                               
    }
    fetch("/api/auth/verify",{
      method:"POST",
      headers:{
        "Content-type":"application/json"
      },
      })
      .then(res=>res.json())
      .then(data=>{
        if(data.code=="error"){
          window.location.href="/account/login"
        }
        else {
          fetch("/cart/add",{
            method:"POST",
            headers:{
              "Content-type":"application/json"
            },
            body:JSON.stringify(dataFinal)
            })
            .then(res=>res.json())
            .then(data=>{
              if(data.code=="error"){
                Swal.fire({
                  icon: 'error',
                  title: 'Thất bại!',
                  text: data.message,
                  timer: 3000,
                  showConfirmButton: false
                });
              }
              else window.location.reload()
            })
        }
    })
  })
}

//End detail - book

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('.inner-menu > ul > li > ul').forEach(ul => {
    if (ul.children.length > 5) {
      ul.classList.add('multi-column');
    }
  });
});

//inner-choose-address
const innerChooseAddress = document.querySelector(".inner-choose-address")
if(innerChooseAddress){
  const innerInfoAddressBox = document.querySelector(".inner-info-address-box")
  const innerInfOverlay = innerInfoAddressBox.querySelector(".inner-info-overlay")
  innerChooseAddress.addEventListener("click",()=>{
    innerInfoAddressBox.classList.toggle("active")
  })
  innerInfOverlay.addEventListener("click",()=>{
    innerInfoAddressBox.classList.toggle("active")
  })
}
//ENd inner-choose-address

//inner-add-address
const innerAddAddress = document.querySelector(".inner-add-address")
if(innerAddAddress){
  const innerAddNewAddress = document.querySelector(".inner-add-new-address")
  const innerAddAddressOverlay = innerAddNewAddress.querySelector(".inner-add-address-overlay")
  innerAddAddress.addEventListener("click",()=>{
    innerAddNewAddress.classList.toggle("active")
  })
  innerAddAddressOverlay.addEventListener("click",()=>{
    innerAddNewAddress.classList.toggle("active")
  })
}
//ENd inner-add-address

//inner-update-list
const innerUpdates = document.querySelectorAll(".inner-update-list")
if(innerUpdates.length>0){
  const innerFillAddress = document.querySelector(".inner-fill-address")
  const innerInfOverlay = innerFillAddress.querySelector(".inner-info-overlay")
  innerUpdates.forEach(innerUpdate => {
    innerUpdate.addEventListener("click",()=>{
    innerFillAddress.classList.toggle("active")
    const idCurrent = innerUpdate.getAttribute("inner-update-item")
    const updateCurrentAddress = document.querySelector("[update-current-address]")
    const deleteCurrentAddress = document.querySelector("[delete-current-address]")
    updateCurrentAddress.setAttribute("id_current",idCurrent)
    deleteCurrentAddress.setAttribute("id_current",idCurrent)
    fetch(`/pay/get-current-address?idCurrent=${idCurrent}`)
    .then(res=>res.json())
    .then(data=>{
      if(data.code=="success"){
        const fullName = innerFillAddress.querySelector("#fullName");
        const phone = innerFillAddress.querySelector("#phone");
        const city = innerFillAddress.querySelector("#city");
        const street = innerFillAddress.querySelector("#street");
        fullName.value = data.addressCurrent.name;
        phone.value = data.addressCurrent.phone;
        city.value = data.addressCurrent.city;
        street.value = data.addressCurrent.street; 
        const district = innerFillAddress.querySelector("#district");
        const ward = innerFillAddress.querySelector("#ward");
        const districtValue = data.addressCurrent.district;
        const wardValue = data.addressCurrent.ward;
        //get district
        fetch(`/pay/districts?cityName=${city.value}`)
          .then(res => res.json())
          .then(data => {
            data.districts.forEach(d => {
              const option = document.createElement("option");
              option.value = d;
              option.textContent = d;
              if(districtValue==d) option.selected=true;
              district.appendChild(option);
            });
          });
        //get ward
        if(districtValue){
          fetch(`/pay/wards?districtName=${districtValue}`)
          .then(res => res.json())
          .then(data => {
            data.wards.forEach(d => {
              const option = document.createElement("option");
              option.value = d;
              option.textContent = d;
              if(wardValue==d) option.selected=true;
              ward.appendChild(option);
            });
          });
        }
        //end get ward

        //change district
        city.addEventListener("change", (e)=> {
          district.innerHTML = '<option value="">Chọn Quận/Huyện</option>';
          ward.innerHTML = '<option value="">Chọn Phường/Xã</option>';
          fetch(`/pay/districts?cityName=${e.target.value}`)
            .then(res => res.json())
            .then(data => {
              data.districts.forEach(d => {
                const option = document.createElement("option");
                option.value = d;
                option.textContent = d;
                if(districtValue==d) option.selected=true;
                district.appendChild(option);
              });  
            });
          }) 
        
        //End change district

        //change ward
        district.addEventListener("change", (e)=> {
          ward.innerHTML = '<option value="">Chọn Phường/Xã</option>';
          fetch(`/pay/wards?districtName=${e.target.value}`)
          .then(res => res.json())
          .then(data => {
            console.log(data.wards)
            data.wards.forEach(d => {
              const option = document.createElement("option");
              option.value = d;
              option.textContent = d;
              if(wardValue==d) option.selected=true;
              ward.appendChild(option);
            });
          });
        })
        //End change ward
      }
      })
      
    })
    
  });

  innerInfOverlay.addEventListener("click",()=>{
    innerFillAddress.classList.toggle("active")
  })
}
//End inner-update-list

//inner-update
const innerUpdate = document.querySelector(".inner-update")
if(innerUpdate){
  const innerFillAddress = document.querySelector(".inner-fill-address2")
  const innerInfOverlay = innerFillAddress.querySelector(".inner-info-overlay")
    innerUpdate.addEventListener("click",()=>{
    innerFillAddress.classList.toggle("active")
    })

  innerInfOverlay.addEventListener("click",()=>{
    innerFillAddress.classList.toggle("active")
  })
}
//End inner-update

// update-current-address
const innerFillAddress1 = document.querySelector("#inner-fill-update")
if(innerFillAddress1){
  const updateBtn = innerFillAddress1.querySelector("[update-current-address]");
  const validation = new JustValidate('#inner-fill-update');
  validation
    .addField('#fullName', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên của bạn!',
      }
    ])
    .addField('#phone', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập số điện thoại của bạn!',
      },
      {
        rule: 'customRegexp',
        value: /^0(3|5|7|8|9)[0-9]{9}$/,
        errorMessage: 'Số điện thoại không hợp lệ! Vui lòng nhập đúng định dạng.',
      },
    ])
    .addField('#city', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng chọn Tỉnh/Thành phố của bạn!',
      }
    ])
    .addField('#district', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng chọn Quận/Huyện của bạn!',
      }
    ])
    .addField('#ward', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng chọn Phường/Xã của bạn!',
      }
    ])
    .addField('#street', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập địa chỉ cụ thể của bạn!',
      }
    ])
    .onSuccess((e) => {
      const id_current = updateBtn.getAttribute("id_current"); 
      const fullName = e.target.fullName.value;
      const phone = e.target.phone.value;
      const city =  e.target.city.value;
      const district =  e.target.district.value;
      const ward =  e.target.ward.value;
      const street =  e.target.street.value;

      const dataFinal ={
        id_current:id_current,
        fullName:fullName,
        phone:phone,
        city:city,
        district:district,
        ward:ward,
        street:street
      }
      console.log(dataFinal)
      fetch("/pay/edit-current-address",{
        method:"POST",
        headers:{
          "Content-type":"application/json"
        },
        body:JSON.stringify(dataFinal)
      })
      .then(res=>res.json())
      .then(data=>{
        if(data.code=="error"){
          Swal.fire({
            icon: 'error',
            title: 'Thất bại!',
            text: 'Cập nhật địa chỉ thất bại!',
            timer: 3000,
            showConfirmButton: false
          });
        }
        else{
          window.location.reload()
        }
      })
    })
}
// End update-current-address

// delete-current-address
const deleteCurrentAddress = document.querySelector("[delete-current-address]")
if(deleteCurrentAddress){
  deleteCurrentAddress.addEventListener("click",()=>{
    const id_current = deleteCurrentAddress.getAttribute("id_current")
    const dataFinal ={
      id_current:id_current,
    }
    fetch("/pay/delete-current-address",{
      method:"POST",
      headers:{
        "Content-type":"application/json"
      },
      body:JSON.stringify(dataFinal)
    })
    .then(res=>res.json())
    .then(data=>{
      if(data.code=="error"){
        Swal.fire({
          icon: 'error',
          title: 'Thất bại!',
          text: data.message,
          timer: 3000,
          showConfirmButton: false
        });
      }
      else{
        window.location.reload()
      }
    })
  })
}
// End delete-current-address


//get district
const citySelect = document.getElementById("city");
const valueCity = citySelect?.getAttribute("saveCity");
const districtSelect = document.getElementById("district");
const valueDistrict = districtSelect?.getAttribute("saveDistrict");
if(valueCity){
  console.log(1)
  fetch(`/pay/districts?cityName=${valueCity}`)
    .then(res => res.json())
    .then(data => {
      const districtSelect = document.querySelector("#district");
      const valueDistrict = districtSelect.getAttribute("saveDistrict");
      data.districts.forEach(d => {
        const option = document.createElement("option");
        option.value = d;
        option.textContent = d;
        if(valueDistrict==d) option.selected=true;
        districtSelect.appendChild(option);
      });
    });
}
if(citySelect){
  citySelect.addEventListener("change", (e)=> {
  // console.log(e.target.value)
  const wardSelect = document.getElementById("ward");
  districtSelect.innerHTML = '<option value="">Chọn Quận/Huyện</option>';
  wardSelect.innerHTML = '<option value="">Chọn Phường/Xã</option>';
  fetch(`/pay/districts?cityName=${e.target.value}`)
    .then(res => res.json())
    .then(data => {
      const districtSelect = document.querySelector("#district");
      const valueDistrict = districtSelect.getAttribute("saveDistrict");
      data.districts.forEach(d => {
        const option = document.createElement("option");
        option.value = d;
        option.textContent = d;
        if(valueDistrict==d) option.selected=true;
        districtSelect.appendChild(option);
      });
    });
  }
  
)}
//end get district  

//get ward
if(valueDistrict){
  fetch(`/pay/wards?districtName=${valueDistrict}`)
  .then(res => res.json())
  .then(data => {
    const wardSelect = document.querySelector("#ward");
    const valueWard =wardSelect.getAttribute("saveWard");
    data.wards.forEach(d => {
      const option = document.createElement("option");
      option.value = d;
      option.textContent = d;
      if(valueWard==d) option.selected=true;
      wardSelect.appendChild(option);
    });
  });
}
const wardSelect = document.getElementById("ward");
if(districtSelect){
  districtSelect.addEventListener("change", (e)=> {
  // console.log(e.target.value)
  wardSelect.innerHTML = '<option value="">Chọn Phường/Xã</option>';
  fetch(`/pay/wards?districtName=${e.target.value}`)
    .then(res => res.json())
    .then(data => {
      const wardSelect = document.querySelector("#ward");
      const valueWard =wardSelect.getAttribute("saveWard");
      data.wards.forEach(d => {
        const option = document.createElement("option");
        option.value = d;
        option.textContent = d;
        if(valueWard==d) option.selected=true;
        wardSelect.appendChild(option);
      });
    });
  }
)}
//end get ward

//chat
const openChat = document.querySelector("[open-chat]")
if(openChat){
  openChat.addEventListener("click",()=>{
    const boxChat = document.querySelector(".box-chat");
    boxChat.classList.toggle("inner-flex")
    
  })
}

const closeChat = document.querySelector("[close-chat]")
if(closeChat){
  closeChat.addEventListener("click",()=>{
    const boxChat = document.querySelector(".box-chat");
    boxChat.classList.toggle("inner-flex")
    
  })
}

const boxChat = document.querySelector(".box-chat");
if (boxChat) {
  const info = boxChat.querySelector("[input-chat]");
  const sendChat = boxChat.querySelector("[send-chat]");
  const handleSendMessage = () => {
    const value = info.value.trim();
    if (value) {
      const chatUser = document.createElement("div");
      chatUser.className = "inner-chat-user";
      chatUser.textContent = value;

      fetch('/api/chatbot/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: value })
      })
      .then(res=>res.json())
      .then(data=>{
        const chatBot = document.createElement("div");
        chatBot.className = "inner-chat-bot";
        chatBot.textContent = data.reply;
        const innerReply = document.querySelector(".inner-reply");
        innerReply.appendChild(chatUser);
        innerReply.appendChild(chatBot);
        innerReply.scrollTop = innerReply.scrollHeight;
        info.value = "";
      })
    }
  }
  sendChat.addEventListener("click", handleSendMessage);

  info.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); 
      handleSendMessage();
    }
  });
}
//end chat

//inner-fill-address2
const innerFillAddress = document.querySelector(".inner-fill-address2")
if(innerFillAddress){
  const validation = new JustValidate('#inner-fill-user');
  validation
    .addField('#fullName', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên của bạn!',
      }
    ])
    .addField('#phone', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập số điện thoại của bạn!',
      },
      {
        rule: 'customRegexp',
         value: /^0(3|5|7|8|9)[0-9]{9}$/,
        errorMessage: 'Số điện thoại không hợp lệ! Vui lòng nhập đúng định dạng.',
      },
    ])
    .addField('#city', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng chọn Tỉnh/Thành phố của bạn!',
      }
    ])
    .addField('#district', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng chọn Quận/Huyện của bạn!',
      }
    ])
    .addField('#ward', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng chọn Phường/Xã của bạn!',
      }
    ])
    .addField('#street', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập địa chỉ cụ thể của bạn!',
      }
    ])
    .onSuccess((e) => {
      const dataFinal = {
        fullName:e.target.fullName.value,
        phone:e.target.phone.value,
        id:e.target.id.value,
        city:e.target.city.value,
        district:e.target.district.value,
        ward:e.target.ward.value,
        street:e.target.street.value
      }
      console.log(dataFinal)
      fetch("/info-user/edit",{
        method:"POST",
        headers:{
          "Content-type":"application/json"
        },
        body:JSON.stringify(dataFinal)
      })
      .then(res=>res.json())
      .then(data=>{
        if(data.code=="error"){
          Swal.fire({
            icon: 'error',
            title: 'Thất bại!',
            text: 'Cập nhật thông tin thất bại!',
            timer: 3000,
            showConfirmButton: false
          });
        }
        else{
          window.location.reload();
        }
      })
    })
}
//End inner-fill-address2

//button-add-new-address
const innerAddNewAddress = document.querySelector(".inner-add-new-address")
if(innerAddNewAddress){
  const fullName = innerAddNewAddress.querySelector("#fullName");
  const phone = innerAddNewAddress.querySelector("#phone");
  const city = innerAddNewAddress.querySelector("#city");
  const district = innerAddNewAddress.querySelector("#district");
  const ward = innerAddNewAddress.querySelector("#ward");
  const street = innerAddNewAddress.querySelector("#street");
  const validation = new JustValidate('#inner-add-new-address');
  validation
    .addField('#fullName', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên của bạn!',
      }
    ])
    .addField('#phone', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập số điện thoại của bạn!',
      },
      {
        rule: 'customRegexp',
        value: /^0(3|5|7|8|9)[0-9]{9}$/,
        errorMessage: 'Số điện thoại không hợp lệ! Vui lòng nhập đúng định dạng.',
      },
    ])
    .addField('#city', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng chọn Tỉnh/Thành phố của bạn!',
      }
    ])
    .addField('#district', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng chọn Quận/Huyện của bạn!',
      }
    ])
    .addField('#ward', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng chọn Phường/Xã của bạn!',
      }
    ])
    .addField('#street', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập địa chỉ cụ thể của bạn!',
      }
    ])
    .onSuccess((event) => {
      const dataFinal = {
        fullName:fullName.value,
        phone:phone.value,
        city:city.value,
        district:district.value,
        ward:ward.value,
        street:street.value
      }

      fetch("/pay/address-create",{
        method:"POST",
        headers:{
          "Content-type":"application/json"
        },
        body:JSON.stringify(dataFinal)
      })
      .then(res=>res.json())
      .then(data=>{
        if(data.code=="error"){
          Swal.fire({
            icon: 'error',
            title: 'Thất bại!',
            text: 'Thêm địa chỉ mới thất bại!',
            timer: 3000,
            showConfirmButton: false
          });
        }
        else{
          window.location.reload();
        }
      })
    })
}
//end button-add-new-address


//choose-address
const radios = document.querySelectorAll("[choose-address]");

if (radios.length > 0) {
  radios.forEach(radio => {
    radio.addEventListener("change", () => {
      if (radio.checked) {
        const id_address = radio.getAttribute("choose-address");
        const innerWrapInfo = document.querySelector(".section-12 .inner-wrap-info");
        const name = innerWrapInfo.querySelector(".inner-name");
        const phone = innerWrapInfo.querySelector(".inner-phone");
        const street = innerWrapInfo.querySelector(".inner-street");
        const city = innerWrapInfo.querySelector(".inner-city");
        fetch(`/pay/change-address?id_address=${id_address}`)
          .then(res => res.json())
          .then(data => {
            const add = data.dataFind;
            city.setAttribute("get-city-final",add.city)
            name.innerHTML = add.name;
            phone.innerHTML = add.phone;
            street.innerHTML = add.street;
            city.innerHTML = `${add.ward}, ${add.district}, ${add.city}`;
            const feeTransport = document.querySelector("[fee-transport]")
            if(!add.city.includes("Hà Nội")){
              feeTransport.innerHTML=(30000).toLocaleString("vi-VN") 
              const additionFee = document.querySelector("[addition-fee]")
              const totalDefault = additionFee.getAttribute("addition-fee")
              const totalFinal = parseInt(totalDefault) + 30000;
              additionFee.innerHTML = totalFinal.toLocaleString("vi-VN")
              const totalSave = document.querySelector("[total-save]")
              totalSave.setAttribute("total-save-final",totalFinal)
            }
            else{
              feeTransport.innerHTML="0"
              const additionFee = document.querySelector("[addition-fee]")
              const totalDefault = additionFee.getAttribute("addition-fee")
              const totalFinal = parseInt(totalDefault);
              additionFee.innerHTML = totalFinal.toLocaleString("vi-VN")
              const totalSave = document.querySelector("[total-save]")
              totalSave.setAttribute("total-save-final",totalFinal)
            }
          })
      }
    });
  });
}


//choose-address

//number-change
const itemInfoDetails = document.querySelectorAll("[item-info-detail]");
if (itemInfoDetails ) {
  let total = 0;  
  itemInfoDetails .forEach(itemInfoDetail => {
    //change quantity
    const numberChange = itemInfoDetail.querySelector("[number-change]")
    numberChange.addEventListener("input", (event) => {
      let value = event.target.value.replace(/[^0-9]/g, "");
      if (value !== "") {
        let number = parseInt(value, 10);
        if (number <= 0) {
          number = 1;
        }
        const valueStock = parseInt(numberChange.getAttribute("stock-book-cart"));
        if (number > valueStock) {
          number = valueStock;
        }
        value = number.toString();
      }
      event.target.value = value;
    });
    numberChange.addEventListener("change", () => {
      const numberQuantity = itemInfoDetail.querySelector("[number-quantity]");
      numberQuantity.innerHTML = numberChange.value;
      const getIdBook = itemInfoDetail.querySelector("[get_id_book]")
      const idBook = getIdBook.getAttribute("get_id_book");
      const getIdUser = itemInfoDetail.querySelector("[get_id_user]")
      const idUser = getIdUser.getAttribute("get_id_user");
      fetch("/cart/edit",{
        method:"POST",
        headers:{
          "Content-type":"application/json"
        },
        body:JSON.stringify({
          quantityNew:numberChange.value,
          idBook:idBook,
          idUser:idUser
        })
      })
      .then(res=>res.json())
      .then(data=>{
        if(data.code=="success"){
          window.location.reload()
        }
      })
    });
    //end change quantity

    //check-item-cart
    const checkItemCarts = itemInfoDetail.querySelectorAll("[check-item-cart]")
    checkItemCarts.forEach(checkItemCart=>{

    checkItemCart.addEventListener("change", () => {
      const getIdBook = itemInfoDetail.querySelector("[get_id_book]");
      const idBook = getIdBook.getAttribute("get_id_book");
      const getIdUser = itemInfoDetail.querySelector("[get_id_user]");
      const idUser = getIdUser.getAttribute("get_id_user");

      fetch("/cart/update-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          idBook: idBook,
          idUser: idUser,
          checkItem: checkItemCart.checked 
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.code === "success") {
            window.location.reload()
          }
        });
      })

      if(checkItemCart.checked){
        const quantity = checkItemCart.getAttribute("quantity")
        const priceBook = checkItemCart.getAttribute("priceBook")
        total+=parseInt(quantity)*parseInt(priceBook)
      }
    })
    //end check-item-cart

    //fill-total
    const totalPrice = document.querySelector("[totalPrice]")
    totalPrice.innerHTML = total.toLocaleString("vi-VN");
  });
}
//End number-change

//aip-delete-item-cart
const aipDeleteItemCarts = document.querySelectorAll("[aip-delete-item-cart]")
if(aipDeleteItemCarts){
  aipDeleteItemCarts.forEach(aipDeleteItemCart=>{
    aipDeleteItemCart.addEventListener("click",()=>{
      console.log(11)
      const api = aipDeleteItemCart.getAttribute("aip-delete-item-cart")
      fetch(api,{
        })
        .then(res=>res.json())
        .then(data=>{
          window.location.reload()
        })
      })
  })
}
//End aip-delete-item-cart

//transport
const getCityFinal = document.querySelector("[get-city-final]")
if(getCityFinal){
  const valueCity = getCityFinal.getAttribute("get-city-final")
  const feeTransport = document.querySelector("[fee-transport]")
  if(valueCity==""){
     feeTransport.innerHTML="0"
  }
  else if(!valueCity.includes("Hà Nội")){
    feeTransport.innerHTML=(30000).toLocaleString("vi-VN")
    const additionFee = document.querySelector("[addition-fee]")
    const totalDefault = additionFee.getAttribute("addition-fee")
    const totalFinal = parseInt(totalDefault) + 30000;
    additionFee.innerHTML = totalFinal.toLocaleString("vi-VN")
    const totalSave = document.querySelector("[total-save]")
    totalSave.setAttribute("total-save-final",totalFinal)
  }
  else{
    feeTransport.innerHTML="0"
  }
}
//End transport

//#order-form
const orderForm = document.querySelector(".order-form")
if(orderForm){
  const createOrder = orderForm.querySelector("[create-order]")
  createOrder.addEventListener("click",()=>{
    const listItems = document.querySelectorAll(".inner-tour-item");
    if (listItems.length == 0) {
      Swal.fire({
        icon: 'error',
        title: 'Thất bại!',
        text: 'Vui lòng chọn ít nhất một sản phẩm để thanh toán!',
        timer: 3000,
        showConfirmButton: false
      });
    }
    const innerWrapInfo = document.querySelector(".section-12 .inner-wrap-info");
    const name = innerWrapInfo.querySelector(".inner-name");
    const phone = innerWrapInfo.querySelector(".inner-phone");
    const street = innerWrapInfo.querySelector(".inner-street");
    const city = innerWrapInfo.querySelector(".inner-city");
    const getName = name.textContent;
    const getPhone = phone.textContent;
    const getStreet = street.textContent;
    const getCity = city.textContent;
    const address = getStreet+ ", " + getCity;
    const selectedMethod = document.querySelector('input[name="method"]:checked').value;
    const listCartFinal = document.querySelector("[listCartFinal]")
    const list = listCartFinal.getAttribute("listCartFinal")
    const totalSaveFinal = document.querySelector("[total-save-final]")
    const additionFee = document.querySelector("[addition-fee]")
    let total = additionFee.getAttribute("addition-fee")
    if(totalSaveFinal){
      total = totalSaveFinal?.getAttribute("total-save-final")
    }
    const dataFinal={
      fullName:getName,
      phone:getPhone,
      note:address,
      method:selectedMethod,
      cart:JSON.parse(list),
      priceTotal:total,
    }
    fetch("/order/create",{
      method:"POST",
      headers:{
        "Content-type":"application/json"
      },
      body:JSON.stringify(dataFinal)
    })
    .then(res=>res.json())
    .then(data=>{
      if(data.code=="error"){
        Swal.fire({
          icon: 'error',
          title: 'Thất bại!',
          text: data.message,
          timer: 3000,
          showConfirmButton: false
        });
      }
      else{
        if (selectedMethod === "zalopay") {
          window.location.href = `/order/payment-zalopay?orderId=${data.orderId}`;
        } 
        else window.location.href =`/order/success?orderId=${data.orderId}&phone=${data.phone}`
      }
    })
  })
}
//End #order-form

//#btn-pay
const btnPay = document.querySelector("#btn-pay");
if(btnPay){
   btnPay.addEventListener("click", () => {
    const checkedItems = document.querySelectorAll("input[check-item-cart]:checked");
    if (checkedItems.length > 0) {
      window.location.href = "/pay";
    } 
    else {
      Swal.fire({
        icon: 'error',
        title: 'Thất bại!',
        text: 'Vui lòng chọn ít nhất một sản phẩm!',
        timer: 3000,
        showConfirmButton: false
      });
    }
  });
}
//End #btn-pay

//inner-find-order 
const innerFindOrder = document.querySelector(".inner-find-order");
if (innerFindOrder) {
  const input = innerFindOrder.querySelector("input");
  const button = innerFindOrder.querySelector("button");

  button.addEventListener("click", () => {
    const keyword = input.value.trim();
    window.location.href = `/order-history?keyword=${encodeURIComponent(keyword)}`;
  });
}

//End inner-find-order 