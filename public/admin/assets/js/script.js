// Menu Mobile
const buttonMenuMobile = document.querySelector(".header .inner-button-menu");
if(buttonMenuMobile) {
  const sider = document.querySelector(".sider");
  const siderOverlay = document.querySelector(".sider-overlay");

  buttonMenuMobile.addEventListener("click", () => {
    sider.classList.add("active");
    siderOverlay.classList.add("active");
  })

  siderOverlay.addEventListener("click", () => {
    sider.classList.remove("active");
    siderOverlay.classList.remove("active");
  })
}
// End Menu Mobile
const sider= document.querySelector(".sider");
if(sider) {
  const pathNameCurrent= window.location.pathname;
  const splitPathNameCurrent= pathNameCurrent.split("/");
  const menuList= sider.querySelectorAll("a");
  menuList.forEach(item => {
  const href= item.href;
  const pathName= new URL(href).pathname;
  const splitPathName=pathName.split("/");
  if(splitPathNameCurrent[1] == splitPathName[1]&&
  splitPathNameCurrent[2] == splitPathName[2]) {
  item.classList.add("active");
  }
})
}
// Schedule Section 8
const scheduleSection8 = document.querySelector(".section-8 .inner-schedule");
if(scheduleSection8) {
  const buttonCreate = scheduleSection8.querySelector(".inner-schedule-create");
  const listItem = scheduleSection8.querySelector(".inner-schedule-list");

  // Tạo mới
  if(buttonCreate) {
    buttonCreate.addEventListener("click", () => {
      const firstItem = listItem.querySelector(".inner-schedule-item");
      const cloneItem = firstItem.cloneNode(true);
      cloneItem.querySelector(".inner-schedule-head input").value = "";

      const body = cloneItem.querySelector(".inner-schedule-body");
      const id = `mce_${Date.now()}`;
      body.innerHTML = `<textarea textarea-mce id="${id}"></textarea>`;

      listItem.appendChild(cloneItem);

      initTinyMCE(`#${id}`);
    })
  }

  listItem.addEventListener("click", (event) => {
    // Đóng/mở item
    if(event.target.closest('.inner-more')) {
      const parentItem = event.target.closest('.inner-schedule-item');
      if (parentItem) {
        parentItem.classList.toggle('hidden');
      }
    }

    // Xóa item
    if(event.target.closest('.inner-remove')) {
      const parentItem = event.target.closest('.inner-schedule-item');
      const totalItem = listItem.querySelectorAll(".inner-schedule-item").length;
      if (parentItem && totalItem > 1) {
        parentItem.remove();
      }
    }
  })

  // Sắp xếp
  new Sortable(listItem, {
    animation: 150, // Thêm hiệu ứng mượt mà
    handle: ".inner-move", // Chỉ cho phép kéo bằng class .inner-move
    onStart: (event) => {
      const textarea = event.item.querySelector("[textarea-mce]");
      const id = textarea.id;
      tinymce.get(id).remove();
    },
    onEnd: (event) => {
      const textarea = event.item.querySelector("[textarea-mce]");
      const id = textarea.id;
      initTinyMCE(`#${id}`);
    }
  });
}

// Filepond Image
const listFilepondImage = document.querySelectorAll("[filepond-image]");
let filePond = {};
if(listFilepondImage.length > 0) {
  listFilepondImage.forEach(filepondImage => {
    FilePond.registerPlugin(FilePondPluginImagePreview);
    FilePond.registerPlugin(FilePondPluginFileValidateType);

    let files = null;
    const elementImageDefault = filepondImage.closest("[image-default]");
    if(elementImageDefault) {
      const imageDefault = elementImageDefault.getAttribute("image-default");
      if(imageDefault) {
        files = [
          {
            source: imageDefault,
          },
        ]
      }
    }

    filePond[filepondImage.name] = FilePond.create(filepondImage, {
      labelIdle: '+',
      files: files
    });
  });

}
// End Filepond Image

// Filepond Image Multi
const listFilepondImageMulti = document.querySelectorAll("[filepond-image-multi]");
let filePondMulti = {};
if(listFilepondImageMulti.length > 0) {
  listFilepondImageMulti.forEach(filepondImage => {
    FilePond.registerPlugin(FilePondPluginImagePreview);
    FilePond.registerPlugin(FilePondPluginFileValidateType);

    let files = null;
    const elementListImageDefault = filepondImage.closest("[list-image-default]");
    if(elementListImageDefault) {
      let listImageDefault = elementListImageDefault.getAttribute("list-image-default");
      if(listImageDefault) {
        listImageDefault = JSON.parse(listImageDefault);
        files = [];
        listImageDefault.forEach(image => {
          files.push({
            source: image, // Đường dẫn ảnh
          });
        })
      }
    }

    filePondMulti[filepondImage.name] = FilePond.create(filepondImage, {
      labelIdle: '+',
      files: files,
    });
  });
}
// End Filepond Image Multi

// Category Create Form
const categoryCreateForm = document.querySelector("#category-create-form");
if(categoryCreateForm) {
  const validation = new JustValidate('#category-create-form');

  validation
    .addField('#name', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên danh mục!'
      }
    ])
    .onSuccess((event) => {
      const name = event.target.name.value;
      const parent = event.target.parent.value;
      const position = event.target.position.value;
      const avatars = filePond.avatar.getFiles();
      let avatar = null;
      if(avatars.length > 0) {
        avatar = avatars[0].file;
      }
      const description = tinymce.get("description").getContent();
      
      const formData = new FormData();
      formData.append("name",name);
      formData.append("parent",parent);
      formData.append("position",position);
      formData.append("avatar",avatar);
      formData.append("description",description);
      
      fetch(`/${pathAdmin}/category/create`,{
        method:"POST",
        body: formData
      })
      .then(res => res.json())
      .then(data =>{
        if(data.code == "error"){
          alert(data.message)
        }
        else{
          window.location.href = `/${pathAdmin}/category/list`
        }
      })
    })
  ;
}
// End Category Create Form

// Category edit Form
const categoryEditForm = document.querySelector("#category-edit-form");
if(categoryEditForm) {
  const validation = new JustValidate('#category-edit-form');

  validation
    .addField('#name', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên danh mục!'
      }
    ])
    .onSuccess((event) => {
      const valueName = document.querySelector("[valueName]")
      const current = valueName.getAttribute("valueName")
      console.log(current)
      const id = event.target.id.value;
      const name = event.target.name.value;
      const parent = event.target.parent.value;
      const position = event.target.position.value;
      const avatars = filePond.avatar.getFiles();
      let avatar = null;
      if (avatars.length > 0) {
        avatar = avatars[0].file;
        const elementImageDefault = event.target.querySelector('#avatar').closest('[image-default]');
        const imageDefault = elementImageDefault.getAttribute('image-default');
        if (imageDefault.includes(avatar.name)) {
          avatar = null;
        }
      }

      const description = tinymce.get("description").getContent();
      
      const formData = new FormData();
      formData.append("name",name);
      formData.append("parent",parent);
      formData.append("position",position);
      formData.append("avatar",avatar);
      formData.append("description",description);
      formData.append("current",current);

      fetch(`/${pathAdmin}/category/edit/${id}`,{
        method:"PATCH",
        body: formData
      })
      .then(res => res.json())
      .then(data =>{
        if(data.code == "error"){
          alert(data.message)
        }
        else{
          window.location.href=`/${pathAdmin}/category/list`
        }
      })
    })
  ;
}
// End Category edit Form


//all button category
const buttonAllcategory = document.querySelector("[button-all]")
if(buttonAllcategory){
  buttonAllcategory.addEventListener("click",()=>{
    const buttonItem = document.querySelectorAll("[button-item]")
    buttonItem.forEach(item => {
      item.checked = buttonAllcategory.checked
    });
  })
}
//end all button category

//change-status-category
const changeStatusCategory = document.querySelector("[ change-status-category]")
if(changeStatusCategory){
  const select = changeStatusCategory.querySelector("select")
  const button = changeStatusCategory.querySelector("button")
  if(button){
    button.addEventListener("click",()=>{
      const listCheck = document.querySelectorAll("[button-item]:checked")
      const ids = []
      listCheck.forEach(item => {
        const id = item.getAttribute("button-item")
        ids.push(id)
      });
      if(ids.length>0&&select.value){
        const dataFinal = {
          status:select.value,
          ids:ids
        }
        fetch(`/${pathAdmin}/category/list`,{
          method:"PATCH",
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
            window.location.reload()
          }
        })
      }
    })
  }
}
//End change-status-category

// Book Create Form
const bookCreateForm = document.querySelector("#book-create-form");
if(bookCreateForm) {
  const validation = new JustValidate('#book-create-form');

  validation
    .addField('#name', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên sách!'
      }
    ])
    .addField('#produce', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập nhà xuất bản!'
      }
    ])
    .addField('#category', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng chọn thể loại!'
      }
    ])
    .addField('#priceBook', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập giá tiền!'
      }
    ])
    .addField('#numberBook', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập số lượng!'
      }
    ])
    .addField('#author', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên tác giả!'
      }
    ])
    .onSuccess((event) => {
      const name = event.target.name.value;
      const produce = event.target.produce.value;
      const author = event.target.author.value;
      const category = event.target.category.value;
      const position = event.target.position.value;
      const avatars = filePond.avatar.getFiles();
      let avatar = null;
      if(avatars.length > 0) {
        avatar = avatars[0].file;
      }
      const priceBook = event.target.priceBook.value;
      const numberBook = event.target.numberBook.value;
      const information = tinymce.get("information").getContent();

      const formData = new FormData()
      formData.append("name",name)
      formData.append("produce",produce)
      formData.append("author",author)
      formData.append("category",category)
      formData.append("position",position)
      formData.append("avatar",avatar)
      formData.append("priceBook",priceBook)
      formData.append("numberBook",numberBook)
      formData.append("information",information)
      if(filePondMulti.images.getFiles().length > 0) {
        filePondMulti.images.getFiles().forEach(item => {
          formData.append("images", item.file);
        })
      }
      fetch(`/${pathAdmin}/book/create`,{
        method:"POST",
        body: formData
      }).
      then(res=>res.json()).
      then(data=>{
        if(data.code=="error"){
          alert(data.message)
        }
        else{
          window.location.href=`/${pathAdmin}/book/list`
        }
      })
    })
  ;
}
// End book Create Form

// book edit Form
const bookeditForm = document.querySelector("#book-edit-form");
if(bookeditForm) {
  const validation = new JustValidate('#book-edit-form');

  validation
    .addField('#name', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên book!'
      }
    ])
    .addField('#produce', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập nhà xuất bản!'
      }
    ])
    .addField('#category', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng chọn thể loại!'
      }
    ])
    .addField('#priceBook', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập giá tiền!'
      }
    ])
    .addField('#numberBook', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập số lượng!'
      }
    ])
    .addField('#author', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên tác giả!'
      }
    ])
    .onSuccess((event) => {
      const valueName = document.querySelector("[valueName]")
      const current = valueName.getAttribute("valueName")
      const id = event.target.id.value
      const name = event.target.name.value;
      const produce = event.target.produce.value;
      const author = event.target.author.value;
      const category = event.target.category.value;
      const position = event.target.position.value;
      const avatars = filePond.avatar.getFiles();
      let avatar = null;
      if(avatars.length > 0) {
        avatar = avatars[0].file;
        const elementImageDefault = event.target.avatar.closest("[image-default]");
        if(elementImageDefault){
          const imageDefault = elementImageDefault.getAttribute("image-default");
          if(imageDefault.includes(avatar.name)) {
            avatar=null
          }
        }
      }
      const priceBook = event.target.priceBook.value;
      const numberBook = event.target.numberBook.value;
      const information = tinymce.get("information").getContent();
    
      const formData = new FormData()
      formData.append("name",name)
      formData.append("category",category)
      formData.append("author",author)
      formData.append("produce",produce)
      formData.append("position",position)
      formData.append("avatar",avatar);
      formData.append("priceBook",priceBook)
      formData.append("numberBook",numberBook)
      formData.append("information",information)
      formData.append("current",current)
      if(filePondMulti.images.getFiles().length > 0) {
        filePondMulti.images.getFiles().forEach(item => {
          formData.append("images", item.file);
        })
      }
      fetch(`/${pathAdmin}/book/edit/${id}`,{
        method:"PATCH",
        body: formData
      })
      .then(res=>res.json())
      .then(data=>{
        if(data.code=="error"){
          alert(data.message)
        }
        else{
          window.location.href=`/${pathAdmin}/book/list`
        }
      })
    })
  ;
}
// End book edit Form


// new Create Form
const newCreateForm = document.querySelector("#new-create-form");
if(newCreateForm) {
  const validation = new JustValidate('#new-create-form');

  validation
    .addField('#name', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên bài viết!'
      }
    ])
    .onSuccess((event) => {
      const name = event.target.name.value;
      const position = event.target.position.value;
      const avatars = filePond.avatar.getFiles();
      let avatar = null;
      if(avatars.length > 0) {
        avatar = avatars[0].file;
      }
      const information = tinymce.get("information").getContent();

      const formData = new FormData()
      formData.append("name",name)
      formData.append("position",position)
      formData.append("avatar",avatar)
      formData.append("content",information)
      fetch(`/${pathAdmin}/new/create`,{
        method:"POST",
        body: formData
      }).
      then(res=>res.json()).
      then(data=>{
        if(data.code=="error"){
          alert(data.message)
        }
        else{
          window.location.href=`/${pathAdmin}/new/list`
        }
      })
    })
  ;
}
// End new Create Form

// new edit Form
const neweditForm = document.querySelector("#new-edit-form");
if(neweditForm) {
  const validation = new JustValidate('#new-edit-form');

  validation
    .addField('#name', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên bài viết!'
      }
    ])
    .onSuccess((event) => {
      const id = event.target.id.value
      const name = event.target.name.value;
      const position = event.target.position.value;
      const avatars = filePond.avatar.getFiles();
      let avatar = null;
      if(avatars.length > 0) {
        avatar= avatars[0].file;
        const elementImageDefault = event.target.avatar.closest("[image-default]");
        if(elementImageDefault){
          const imageDefault = elementImageDefault.getAttribute("image-default");
          if(imageDefault.includes(avatar.name)) {
            avatar=null
          }
        }
      }
      const information = tinymce.get("information").getContent();
    
      const formData = new FormData()
      formData.append("name",name)
      formData.append("position",position)
      formData.append("avatar",avatar);
      formData.append("content",information)
      fetch(`/${pathAdmin}/new/edit/${id}`,{
        method:"PATCH",
        body: formData
      })
      .then(res=>res.json())
      .then(data=>{
        if(data.code=="error"){
          alert(data.message)
        }
        else{
          window.location.href=`/${pathAdmin}/new/list`
        }
      })
    })
  ;
}
// End new edit Form

// Order Edit Form
const orderEditForm = document.querySelector("#order-edit-form");
if(orderEditForm) {
  const validation = new JustValidate('#order-edit-form');

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
    .addField('#phone', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập số điện thoại!'
      },
      {
        rule: 'customRegexp',
        value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
        errorMessage: 'Số điện thoại không đúng định dạng!'
      },
    ])
    .onSuccess((event) => {
      const fullName = event.target.fullName.value;
      const code = event.target.code.value
      const phone = event.target.phone.value;
      const note = event.target.note.value;
      const paymentMethod = event.target.paymentMethod.value;
      const paymentStatus = event.target.paymentStatus.value;
      const status = event.target.status.value;

      const dataFinal = {
        fullName,
        phone,
        note,
        method:paymentMethod,
        payStatus:paymentStatus,
        status
      }
      fetch(`/${pathAdmin}/order/edit/${code}`,{
        method:"PATCH",
        headers:{
          "Content-type":"application/json"
        },
        body:JSON.stringify(dataFinal)
      })
      .then(res=>res.json())
      .then(data=>{
        if(data.code=="error"){
          alert(data.message)
        }
        else{
          window.location.href = `/${pathAdmin}/order/list`
        }
      })
    })
  ;
}
// End Order Edit Form

//order-delete
const orderDeletes = document.querySelectorAll("[order-delete]")
if(orderDeletes){
  orderDeletes.forEach(orderDelete => {
    orderDelete.addEventListener("click",()=>{
    const apiDelete = orderDelete.getAttribute("order-delete")
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa đơn hàng này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Đồng ý"
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(apiDelete,{
          method:"PATCH"
        })
        .then(res=>res.json())
        .then(data=>{
          if(data.code=='error'){
            alert(data.message)
          }
          else{
            Swal.fire({
              title: "Đã xóa đơn hàng thành công!",
              icon: "success"
            });
            window.location.reload()
          }
        })
      }
    });

  })
  });
}
//End order-delete

// Setting Website Info Form
const settingWebsiteInfoForm = document.querySelector("#setting-website-info-form");
if(settingWebsiteInfoForm) {
  const validation = new JustValidate('#setting-website-info-form');

  validation
    .addField('#websiteName', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên website!'
      },
    ])
    .addField('#email', [
      {
        rule: 'email',
        errorMessage: 'Email không đúng định dạng!',
      },
    ])
    .onSuccess((event) => {
      const websiteName = event.target.websiteName.value;
      const phone = event.target.phone.value;
      const email = event.target.email.value;
      const address = event.target.address.value;
      const logos = filePond.logo.getFiles();
      let logo = null;
      if(logos.length > 0) {
        logo = logos[0].file;
      }
      const favicons = filePond.favicon.getFiles();
      let favicon = null;
      if(favicons.length > 0) {
        favicon = favicons[0].file;
      }
      const formData = new FormData()
      formData.append("websiteName",websiteName)
      formData.append("phone",phone)
      formData.append("email",email)
      formData.append("address",address)
      formData.append("logo",logo)
      formData.append("favicon",favicon)

      fetch(`/${pathAdmin}/setting/website/info`,{
        method:"PATCH",
        body: formData
      })
      .then(res=>res.json())
      .then(data=>{
        if(data.code=="error"){
          alert(data.message)
        }
        else{
          window.location.href =`/${pathAdmin}/setting/list`
        }
      })
    })
  ;
}
// End Setting Website Info Form

// Setting Account Admin Create Form
const settingAccountAdminCreateForm = document.querySelector("#setting-account-admin-create-form");
if(settingAccountAdminCreateForm) {
  const validation = new JustValidate('#setting-account-admin-create-form');

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
        errorMessage: 'Vui lòng nhập email!'
      },
      {
        rule: 'email',
        errorMessage: 'Email không đúng định dạng!',
      },
    ])
    .addField('#phone', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập số điện thoại!'
      },
      {
        rule: 'customRegexp',
        value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
        errorMessage: 'Số điện thoại không đúng định dạng!'
      },
    ])
    .addField('#role', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng chọn nhóm quyền!'
      }
    ])
    .addField('#positionCompany', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập chức vụ!'
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
      const fullName = event.target.fullName.value;
      const email = event.target.email.value;
      const phone = event.target.phone.value;
      const role = event.target.role.value;
      const positionCompany = event.target.positionCompany.value;
      const status = event.target.status.value;
      const password = event.target.password.value;
      const avatars = filePond.avatar.getFiles();
      let avatar = null;
      if(avatars.length > 0) {
        avatar = avatars[0].file;
      }

      const formData = new FormData()
      formData.append("fullName",fullName)
      formData.append("email",email)
      formData.append("phone",phone)
      formData.append("role",role)
      formData.append("positionCompany",positionCompany)
      formData.append("status",status)
      formData.append("password",password)
      formData.append("avatar",avatar)
      
      fetch(`/${pathAdmin}/setting/account-admin/create`,{
        method:"POST",
        body:formData
      })
      .then(res=>res.json())
      .then(data=>{
        if(data.code =="error"){
          alert(data.message)
        }
        else{
          window.location.href = `/${pathAdmin}/setting/account-admin/list`
        }
      })
    })
  ;
}
// End Setting Account Admin create Form

// Setting Account Admin edit Form
const settingAccountAdminEditForm = document.querySelector("#setting-account-admin-edit-form");
if(settingAccountAdminEditForm) {
  const validation = new JustValidate('#setting-account-admin-edit-form');

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
        errorMessage: 'Vui lòng nhập email!'
      },
      {
        rule: 'email',
        errorMessage: 'Email không đúng định dạng!',
      },
    ])
    .addField('#phone', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập số điện thoại!'
      },
      {
        rule: 'customRegexp',
        value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
        errorMessage: 'Số điện thoại không đúng định dạng!'
      },
    ])
    .addField('#positionCompany', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập chức vụ!'
      },
    ])
    .addField('#role', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng chọn nhóm quyền!'
      },
    ])
    .onSuccess((event) => {
      const id = event.target.id.value;
      const fullName = event.target.fullName.value;
      const email = event.target.email.value;
      const phone = event.target.phone.value;
      const role = event.target.role.value;
      const positionCompany = event.target.positionCompany.value;
      const status = event.target.status.value;
      const password = event.target.password.value;
      const avatars = filePond.avatar.getFiles();
      let avatar = null;
      if(avatars.length > 0) {
        avatar = avatars[0].file;
        const elementImageDefault = event.target.avatar.closest("[image-default]");
        const imageDefault = elementImageDefault.getAttribute("image-default");
        if(imageDefault.includes(avatar.name)) {
          avatar=null
        }
      }

      const formData = new FormData()
      formData.append("fullName",fullName)
      formData.append("email",email)
      formData.append("phone",phone)
      formData.append("role",role)
      formData.append("positionCompany",positionCompany)
      formData.append("status",status)
      if(password) formData.append("password",password)
      formData.append("avatar",avatar)
      fetch(`/${pathAdmin}/setting/account-admin/edit/${id}`,{
        method:"PATCH",
        body:formData
      })
      .then(res=>res.json())
      .then(data=>{
        if(data.code =="error"){
          alert(data.message)
        }
        else{
          window.location.href= `/${pathAdmin}/setting/list`
        }
      })
    })
  ;
}
// End Setting Account Admin edit Form


//----------Filter account
//Filter account status
const filterAccountStatus = document.querySelector("[filter-account-status]");
if(filterAccountStatus){
  const url = new URL(window.location.href)
  filterAccountStatus.addEventListener("change",()=>{
    const value = filterAccountStatus.value;
    if(value){
      url.searchParams.set("status",value);
    }
    else{
      url.searchParams.delete("status")
    }
    window.location.href = url
  })
  const currentValue = url.searchParams.get("status")
  if(currentValue) filterAccountStatus.value = currentValue
}
//end Filter account status

//Filter startDate
const filterAccountstartDate = document.querySelector("[filter-account-startDate]");
if(filterAccountstartDate){
  const url = new URL(window.location.href)
  filterAccountstartDate.addEventListener("change",()=>{
    const value = filterAccountstartDate.value;
    if(value){
      url.searchParams.set("startdate",value);
    }
    else{
      url.searchParams.delete("startdate")
    }
    window.location.href = url
  })
  const currentValue = url.searchParams.get("startdate")
  if(currentValue) filterAccountstartDate.value = currentValue
}
//end Filter account startDate

//Filter account EndDate
const filterAccountEndDate = document.querySelector("[filter-account-EndDate]");
if(filterAccountEndDate){
  const url = new URL(window.location.href)
  filterAccountEndDate.addEventListener("change",()=>{
    const value = filterAccountEndDate.value;
    if(value){
      url.searchParams.set("enddate",value);
    }
    else{
      url.searchParams.delete("enddate")
    }
    window.location.href = url
  })
  const currentValue = url.searchParams.get("enddate")
  if(currentValue) filterAccountEndDate.value = currentValue
}
//end Filter account EndDate

//Filter account role
const filterAccountRole = document.querySelector("[filter-account-role]");
if(filterAccountRole){
  const url = new URL(window.location.href)
  filterAccountRole.addEventListener("change",()=>{
    const value = filterAccountRole.value;
    if(value){
      url.searchParams.set("role",value);
    }
    else{
      url.searchParams.delete("role")
    }
    window.location.href = url
  })
  const currentValue = url.searchParams.get("role")
  if(currentValue) filterAccountRole.value = currentValue
}
//end Filter account role
//Filter account delete
const filerAccountDelete = document.querySelector("[filter-account-delete]")
if(filerAccountDelete){
  const url = new URL(window.location.href)
  filerAccountDelete.addEventListener("click",()=>{
    url.search= ""
    window.location.href = url
  })
}
//End Filter delete

//Check All account  
const checkAllAccount = document.querySelector("[checkALlAccount")
if(checkAllAccount){
  checkAllAccount.addEventListener("click",()=>{
    const checkItem = document.querySelectorAll("[checkItem]")
    checkItem.forEach(item => {
      item.checked = checkAllAccount.checked
    });
  })
}
//End Check All account

//search account
const searchAccount = document.querySelector("[searchAccount]")
if(searchAccount){
  const url = new URL(window.location.href)
  searchAccount.addEventListener("keyup",(event)=>{
    console.log(searchAccount.value)
    if(event.code == "Enter"){
      const value = searchAccount.value
      if(value){
        url.searchParams.set("keyword",value.trim())
      }
      else{
        url.searchParams.delete("keyword")
      }
      window.location.href = url.href
    }  
  })
  const currentSearchAccount = url.searchParams.get("keyword")
  if(currentSearchAccount){
    searchAccount.value = currentSearchAccount
  }
}
//End search account

//pagination account
const innerPaginationAccount = document.querySelector("[account-page]")
if(innerPaginationAccount){
  const url = new URL(window.location.href)
  innerPaginationAccount.addEventListener("change",()=>{
    const value = innerPaginationAccount.value
    if(value){
      url.searchParams.set("page",value)
    }
    else{
      url.searchParams.delete("page")
    }
    window.location.href = url.href 
  })
  const currentPage = url.searchParams.get("page")
  if(currentPage) innerPaginationAccount.value = currentPage
}
//End pagination account

//change-status account
const changeStatusAccount = document.querySelector("[change-status-account]")
if(changeStatusAccount){
  const select = changeStatusAccount.querySelector("select")
  const button = changeStatusAccount.querySelector("button")
  if(button){
    button.addEventListener("click",()=>{
      const listChecked = document.querySelectorAll("[checkItem]:checked")
      const ids= []
      listChecked.forEach(item => {
        const id = item.getAttribute("checkItem")
        ids.push(id)
      });
      if(select.value && ids.length>0){
        const dataFinal = {
          status:select.value,
          ids:ids
        }
        fetch(`/${pathAdmin}/setting/account-admin/changePatch`,{
          method:"PATCH",
          headers:{
            "Content-type":"application/json"
          },
          body:JSON.stringify(dataFinal)
        })
        .then(res=>res.json())
        .then(data=>{
          if(data.code=="error"){
            alert(data.message)
          }
          else{
            window.location.reload()
          }
        })
      }
    })
  }
}
//End change-status account
//End----------Filter category

//button Delete category
const buttonDeleteAccount = document.querySelectorAll("[button-delete-account]")
if(buttonDeleteAccount.length >0)
{
  buttonDeleteAccount.forEach(button => {
    button.addEventListener("click",()=>{
      const apiDelete = button.getAttribute("api-delete-account")
      fetch(apiDelete,{
        method:"PATCH"
      })
      .then(res=>res.json())
      .then(data=>{
        if(data.code=="error")
          alert(data.message)
        else
          window.location.reload();
      })
    })
  });
}
//End button Delete category

// Setting Role Create Form
const settingRoleCreateForm = document.querySelector("#setting-role-create-form");
if(settingRoleCreateForm) {
  const validation = new JustValidate('#setting-role-create-form');

  validation
    .addField('#name', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên nhóm quyền!'
      },
    ])
    .onSuccess((event) => {
      const name = event.target.name.value;
      const description = event.target.description.value;
      const permissions = [];

      // permissions
      const listElementPermission = settingRoleCreateForm.querySelectorAll('input[name="permissions"]:checked');
      listElementPermission.forEach(input => {
        permissions.push(input.value);
      });
      // End permissions
      const dataFinal ={
        name:name,
        description:description,
        permissions:permissions
      }

      fetch(`/${pathAdmin}/setting/role/create`,{
        method:"POST",
        headers:{
          "Content-type":"application/json"
        },
        body:JSON.stringify(dataFinal)
      })
      .then(res=>res.json())
      .then(data=>{
        if(data.code=="error"){
          alert(data.message)
        }
        else{
          window.location.href = `/${pathAdmin}/setting/role/list`
        }
      })
    })
  ;
}
// End Setting Role Create Form

// Setting Role Edit Form
const settingRoleeditForm = document.querySelector("#setting-role-edit-form");
if(settingRoleeditForm) {
  const validation = new JustValidate('#setting-role-edit-form');

  validation
    .addField('#name', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên nhóm quyền!'
      },
    ])
    .onSuccess((event) => {
      const id = event.target.id.value;
      const name = event.target.name.value;
      const description = event.target.description.value;
      const permissions = [];

      // permissions
      const listElementPermission = settingRoleeditForm.querySelectorAll('input[name="permissions"]:checked');
      listElementPermission.forEach(input => {
        permissions.push(input.value);
      });
      // End permissions

      const dataFinal ={
        name:name,
        description:description,
        permissions:permissions
      }

      fetch(`/${pathAdmin}/setting/role/edit/${id}`,{
        method:"PATCH",
        headers:{
          "Content-type":"application/json"
        },
        body:JSON.stringify(dataFinal)
      })
      .then(res=>res.json())
      .then(data=>{
        if(data.code=="error"){
          alert(data.message)
        }
        else{
          window.location.href = `/${pathAdmin}/setting/role/list`
        }
      })
    })
  ;
}
// End Setting Role Edit Form

//setting role delete
const buttonDeleteRole = document.querySelector("[apiroledelete]")
if(buttonDeleteRole){
  buttonDeleteRole.addEventListener("click",()=>{
    const api = buttonDeleteRole.getAttribute("apiroledelete")
    fetch(api,{
      method:"PATCH"
    })
    .then(res=>res.json())
    .then(data=>{
      if(data.code=="error"){
        alert(data.message)
      }
      else{
        window.location.reload()
      }
    })
  })
}
//END setting role delete

//check all role
const checkAllRole = document.querySelector("[checkAllRole]")
if(checkAllRole){
  const checkItemRole = document.querySelectorAll("[checkItemRole]")
  checkAllRole.addEventListener("click",()=>{
    checkItemRole.forEach(item => {
      item.checked = checkAllRole.checked
    })
  })
}
//End check all role

//Setting role filter 
const filterRole = document.querySelector("[filter-role]")
if(filterRole){
  const select = filterRole.querySelector("select")
  const button = filterRole.querySelector("button")
  if(button){
    button.addEventListener("click",()=>{
    const listChecked = document.querySelectorAll("[checkItemRole]:checked")
    const ids = []
    listChecked.forEach(item => {
      const id = item.getAttribute("checkItemRole")
      ids.push(id)
    });
    if(ids.length>0 && select.value){
      const dataFinal ={
        status:select.value,
        ids:ids
      }
      fetch(`/${pathAdmin}/setting/role/list`,{
        method:"PATCH",
        headers:{
          "Content-type":"application/json",
        },
        body: JSON.stringify(dataFinal)
      })
      .then(res=>res.json())
      .then(data=>{
        if(data.code=="error"){
          alert(data.message)
        }
        else{
          window.location.reload()
        }
      })
    }
    // fetch(`/${pathAdmin}/setting/role/list`)
    })
  }
}
//End setting role filter

//search role
const searchRole = document.querySelector("[search-role]")
if(searchRole){
  const url = new URL(window.location.href)
  searchRole.addEventListener("keyup",(event)=>{
    const value = searchRole.value
    if(event.code == "Enter"){
      if(value){
        url.searchParams.set("keyword",value)
      }
      else{
        url.searchParams.delete("keyword")
      }
      window.location.href = url.href
    }
  })
  const currentValue = url.searchParams.get("keyword")
  if(currentValue) searchRole.value = currentValue
}
//End search role

// Profile Edit Form
const profileEditForm = document.querySelector("#profile-edit-form");
if(profileEditForm) {
  const validation = new JustValidate('#profile-edit-form');

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
        errorMessage: 'Vui lòng nhập email!'
      },
      {
        rule: 'email',
        errorMessage: 'Email không đúng định dạng!',
      },
    ])
    .addField('#phone', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập số điện thoại!'
      },
      {
        rule: 'customRegexp',
        value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
        errorMessage: 'Số điện thoại không đúng định dạng!'
      },
    ])
    .onSuccess((event) => {
      const id = event.target.id.value
      const fullName = event.target.fullName.value;
      const email = event.target.email.value;
      const phone = event.target.phone.value;
      const avatars = filePond.avatar.getFiles();
      let avatar = null;
      if(avatars.length > 0) {
        avatar = avatars[0].file;
        const elementImageDefault = event.target.avatar.closest("[image-default]");
        if(elementImageDefault){
          const imageDefault = elementImageDefault.getAttribute("image-default");
          if(imageDefault.includes(avatar.name)) {
            avatar=null
          }
        }
      }
      const formData = new FormData()
      formData.append("fullName",fullName)
      formData.append("email",email)
      formData.append("phone",phone)
      formData.append("avatar",avatar)

      fetch(`/${pathAdmin}/profile/edit/${id}`,{
        method:"PATCH",
        body:formData
      })
      .then(res=>res.json())
      .then(data=>{
        if(data.code=="error"){
          alert(data.message)
        }
        else{
          window.location.href = `/${pathAdmin}/dashboard`
        }
      })
    })
  ;
}
// End Profile Edit Form

// Profile Change Password Form
const profileChangePasswordForm = document.querySelector("#profile-change-password-form");
if(profileChangePasswordForm) {
  const validation = new JustValidate('#profile-change-password-form');

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
    .addField('#confirmPassword', [
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
      fetch(`/${pathAdmin}/profile/change-password`,{
        method:"PATCH",
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
          window.location.reload()
        }
      })
    })
  ;
}
// End Profile Change Password Form




//logout
const buttonLogout = document.querySelector(".sider .inner-logout");
if(buttonLogout){
  buttonLogout.addEventListener("click", ()=>{
    fetch(`/${pathAdmin}/account/logout`,{
      method:"POST"
    })
    .then(res=>res.json())
    .then(data =>{
      if(data.code == "success"){
        window.location.href = `/${pathAdmin}/account/login`;
      }
    })
  })
}
// Alert
const alertTime = document.querySelector("[alert-time]");
if(alertTime) {
  let time = alertTime.getAttribute("alert-time");
  time = time ? parseInt(time) : 4000;
  setTimeout(() => {
    alertTime.remove(); // Xóa phần tử khỏi giao diện
  }, time);
}
// End Alert

//button Delete category
const buttonDelete = document.querySelectorAll("[button-delete]")
if(buttonDelete.length >0)
{
  buttonDelete.forEach(button => {
    button.addEventListener("click",()=>{
      const apiDelete = button.getAttribute("api-delete-cate")
      Swal.fire({
        title: "Bạn có chắc chắn muốn xóa danh mục này không?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Đồng ý"
      }).then((result) => {
      if (result.isConfirmed) {
        fetch(apiDelete,{
          method:"PATCH"
        })
        .then(res=>res.json())
        .then(data=>{
          if(data.code=="error")
            alert(data.message)
          else
            window.location.reload();
        })
      }
    })
    })
  });
}
//End button Delete category

//----------Filter category
//Filter status
const filterStatus = document.querySelector("[filter-status]");
if(filterStatus){
  const url = new URL(window.location.href)
  filterStatus.addEventListener("change",()=>{
    const value = filterStatus.value;
    if(value){
      url.searchParams.set("status",value);
    }
    else{
      url.searchParams.delete("status")
    }
    window.location.href = url
  })
  const currentValue = url.searchParams.get("status")
  if(currentValue) filterStatus.value = currentValue
}
//end Filter status

//Filter creater
const filtercreater = document.querySelector("[filter-creater]");
if(filtercreater){
  const url = new URL(window.location.href)
  filtercreater.addEventListener("change",()=>{
    const value = filtercreater.value;
    if(value){
      url.searchParams.set("id",value);
    }
    else{
      url.searchParams.delete("id")
    }
    window.location.href = url
  })
  const currentValue = url.searchParams.get("id")
  if(currentValue) filtercreater.value = currentValue
}
//end Filter creater

//Filter startDate
const filterstartDate = document.querySelector("[filter-startDate]");
if(filterstartDate){
  const url = new URL(window.location.href)
  filterstartDate.addEventListener("change",()=>{
    const value = filterstartDate.value;
    if(value){
      url.searchParams.set("startdate",value);
    }
    else{
      url.searchParams.delete("startdate")
    }
    window.location.href = url
  })
  const currentValue = url.searchParams.get("startdate")
  if(currentValue) filterstartDate.value = currentValue
}
//end Filter startDate

//Filter EndDate
const filterEndDate = document.querySelector("[filter-EndDate]");
if(filterEndDate){
  const url = new URL(window.location.href)
  filterEndDate.addEventListener("change",()=>{
    const value = filterEndDate.value;
    if(value){
      url.searchParams.set("enddate",value);
    }
    else{
      url.searchParams.delete("enddate")
    }
    window.location.href = url
  })
  const currentValue = url.searchParams.get("enddate")
  if(currentValue) filterEndDate.value = currentValue
}
//end Filter EndDate

//Filter delete
const filerDelete = document.querySelector("[filter-delete]")
if(filerDelete){
  const url = new URL(window.location.href)
  filerDelete.addEventListener("click",()=>{
    url.search= ""
    window.location.href = url
  })
}
//End Filter delete

//Check All     
const checkAll = document.querySelector("[checkALl")
if(checkAll){
  checkAll.addEventListener("click",()=>{
    const checkItem = document.querySelectorAll("[checkItem]")
    checkItem.forEach(item => {
      item.checked = checkAll.checked
    });
  })
}
//End Check All

//search book
const search = document.querySelector("[search]")
if(search){
  const url = new URL(window.location.href)
  search.addEventListener("keyup",(event)=>{
    if(event.code == "Enter"){
      const value = search.value
      if(value){
        url.searchParams.set("keyword",value.trim())
      }
      else{
        url.searchParams.delete("keyword")
      }
      window.location.href = url.href
    }  
  })
  const currentSearch = url.searchParams.get("keyword")
  if(currentSearch){
    search.value = currentSearch
  }
}
//End search book

//pagination
const innerPagination = document.querySelector(".inner-pagination")
if(innerPagination){
  const url = new URL(window.location.href)
  innerPagination.addEventListener("change",()=>{
    const value = innerPagination.value
    if(value){
      url.searchParams.set("page",value)
    }
    else{
      url.searchParams.delete("page")
    }
    window.location.href = url.href 
  })
  const currentValue = url.searchParams.get("page")
  const totalHtml = document.querySelector("[total]")
  const total = totalHtml.getAttribute("total")
  if(currentValue){
    if(currentValue>total){
      innerPagination.value = total
    }
    else if(currentValue<=0){
      innerPagination.value = 1
    }
    else{
      innerPagination.value= currentValue
    }
  }
}
//End pagination

//End----------Filter category

//----------Filter book
//filter-creater book
const bookCreater = document.querySelector("[book-creater]")
if(bookCreater){
  const url = new URL(window.location.href)
  bookCreater.addEventListener("change",()=>{
    const value = bookCreater.value
    if(value){
      url.searchParams.set("id",value)
    }
    else{
      url.searchParams.delete("id")
    }
    window.location.href = url.href
  })
  const currentValue = url.searchParams.get("id")
  if(currentValue) bookCreater.value = currentValue
}
//filter-creater book

//filter-date book
//start date
const startDate = document.querySelector("[start-date]")
if(startDate){
  const url = new URL(window.location.href)
  startDate.addEventListener("change",()=>{
    const value = startDate.value
    if(value){
      url.searchParams.set("startDate",value)
    }
    else{
      url.searchParams.delete("startDate")
    }
    window.location.href = url.href
  })
  const currentValue = url.searchParams.get("startDate")
  if(currentValue) startDate.value = currentValue
}
//end start date

//end date
const endDate = document.querySelector("[end-date]")
if(endDate){
  const url = new URL(window.location.href)
  endDate.addEventListener("change",()=>{
    const value = endDate.value
    if(value){
      url.searchParams.set("endDate",value)
    }
    else{
      url.searchParams.delete("endDate")
    }
    window.location.href = url.href
  })
  const currentValue = url.searchParams.get("endDate")
  if(currentValue) endDate.value = currentValue
}
//end end date
//End filter-date book

//filter-category book
const bookCategory = document.querySelector("[book-category]")
if(bookCategory){
  const url = new URL(window.location.href)
  bookCategory.addEventListener("change",()=>{
    const value = bookCategory.value
    if(value){
      url.searchParams.set("category",value)
    }
    else{
      url.searchParams.delete("category")
    }
    window.location.href = url.href
  })
  const currentValue = url.searchParams.get("category")
  if(currentValue) bookCategory.value = currentValue
}
//End filter-category book


//filter-price
const filterPrice = document.querySelector("[filter-price]")
if(filterPrice){
  const url = new URL(window.location.href)
  filterPrice.addEventListener("change",()=>{
    const priceValue = filterPrice.value
    if(priceValue){
      url.searchParams.set("price",priceValue)
    }
    else{
      url.searchParams.delete("price")
    }
    window.location.href = url.href
  })
  const currentPrice = url.searchParams.get("price")
  if(currentPrice) filterPrice.value =currentPrice
}
//end filter-price

//button reset book
const buttonResetbook = document.querySelector("[button-reset]")
if(buttonResetbook){
  const url = new URL(window.location.href)
  buttonResetbook.addEventListener("click",()=>{
    url.search=""
    window.location.href = url.href
  })
}
//End button reset book

//all button book
const buttonAllbook = document.querySelector("[button-all]")
if(buttonAllbook){
  buttonAllbook.addEventListener("click",()=>{
    const buttonItem = document.querySelectorAll("[button-item]")
    buttonItem.forEach(item => {
      item.checked = buttonAllbook.checked
    });
  })
}
//end all button book

//change-status book
const changeStatus = document.querySelector("[change-status-book]")
if(changeStatus){
  const select = changeStatus.querySelector("select")
  const button = changeStatus.querySelector("button")
  if(button){
    button.addEventListener("click",()=>{
      const listChecked = document.querySelectorAll("[button-item]:checked")
      const ids= []
      listChecked.forEach(item => {
        const id = item.getAttribute("button-item")
        ids.push(id)
      });
      if(ids.length>0){
        const dataFinal = {
          ids:ids,
          id_event:select.value
        }
        console.log(dataFinal)
        fetch(`/${pathAdmin}/book/changePatch`,{
          method:"PATCH",
          headers:{
            "Content-type":"application/json"
          },
          body:JSON.stringify(dataFinal)
        })
        .then(res=>res.json())
        .then(data=>{
          if(data.code=="error"){
            alert(data.message)
          }
          else{
            window.location.reload()
          }
        })
      }
    })
  }
}
//End change-status book

//book search
const url = new URL(window.location.href)
const bookSearch = document.querySelector("[book-search]")
if(bookSearch){
  bookSearch.addEventListener("keyup",(event)=>{
    const value = bookSearch.value
    if(event.code=="Enter"){
      if(value)
        url.searchParams.set("keyword",value.trim())
      else  
        url.searchParams.delete("keyword")
      window.location.href = url.href
    }
  })
  const currentValue = url.searchParams.get("keyword")
  if(currentValue) bookSearch.value = currentValue
}
//End book search

//pagination book
const bookPage = document.querySelector("[book-page]")
if(bookPage){
  const url = new URL(window.location.href)
  bookPage.addEventListener("change",()=>{
    const value = bookPage.value
    if(value){
      url.searchParams.set("page",value)
    }
    else{
      url.searchParams.delete("page")
    }
    window.location.href = url.href
  })
  const currentValue = url.searchParams.get("page")
  const totalHtml = document.querySelector("[total]")
  const total = totalHtml.getAttribute("total")
  if(currentValue){
    if(currentValue>total){
      bookPage.value = total
    }
    else if(currentValue<=0){
      bookPage.value = 1
    }
    else{
      bookPage.value= currentValue
    }
  }
}
//End pagination book

//button delete book
const buttonDeletebooks = document.querySelectorAll("[button-delete-book]")
if(buttonDeletebooks){  
  buttonDeletebooks.forEach(buttonDeletebook => {
    buttonDeletebook.addEventListener("click",()=>{
    const api= buttonDeletebook.getAttribute("button-delete-book")
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa sách này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Đồng ý"
    }).then((result) => {
      if (result.isConfirmed) {
      fetch(api,{
        method:"PATCH"
      })
      .then(res=>res.json())
      .then(data=>{
        if(data.code=="error"){
          alert(data.message)
        }
        else{
          window.location.reload()
        }
      })
    }})
    })
  });
}
//End button delete book
//End----------Filter book


//----------Filter new
//filter-creater new
const newCreater = document.querySelector("[new-creater]")
if(newCreater){
  const url = new URL(window.location.href)
  newCreater.addEventListener("change",()=>{
    const value = newCreater.value
    if(value){
      url.searchParams.set("id",value)
    }
    else{
      url.searchParams.delete("id")
    }
    window.location.href = url.href
  })
  const currentValue = url.searchParams.get("id")
  if(currentValue) newCreater.value = currentValue
}
//filter-creater new

//filter-date new
//start date 
const startDateNew = document.querySelector("[start-date]")
if(startDateNew){
  const url = new URL(window.location.href)
  startDateNew.addEventListener("change",()=>{
    const value = startDateNew.value
    if(value){
      url.searchParams.set("startDate",value)
    }
    else{
      url.searchParams.delete("startDate")
    }
    window.location.href = url.href
  })
  const currentValue = url.searchParams.get("startDate")
  if(currentValue) startDateNew.value = currentValue
}
//end start date

//end date
const endDateNew = document.querySelector("[end-date]")
if(endDateNew){
  const url = new URL(window.location.href)
  endDateNew.addEventListener("change",()=>{
    const value = endDateNew.value
    if(value){
      url.searchParams.set("endDate",value)
    }
    else{
      url.searchParams.delete("endDate")
    }
    window.location.href = url.href
  })
  const currentValue = url.searchParams.get("endDate")
  if(currentValue) endDateNew.value = currentValue
}
//end end date
//End filter-date new

//change-status new
const changeStatusNew = document.querySelector("[change-status]")
if(changeStatusNew){
  const select = changeStatusNew.querySelector("select")
  const button = changeStatusNew.querySelector("button")
  if(button){
    button.addEventListener("click",()=>{
      const listChecked = document.querySelectorAll("[button-item]:checked")
      const ids= []
      listChecked.forEach(item => {
        const id = item.getAttribute("button-item")
        ids.push(id)
      });
      if(select.value && ids.length>0){
        const dataFinal = {
          ids:ids
        }
        fetch(`/${pathAdmin}/new/changePatch`,{
          method:"PATCH",
          headers:{
            "Content-type":"application/json"
          },
          body:JSON.stringify(dataFinal)
        })
        .then(res=>res.json())
        .then(data=>{
          if(data.code=="error"){
            alert(data.message)
          }
          else{
            window.location.reload()
          }
        })
      }
    })
  }
}
//End change-status new

//new search

const newSearch = document.querySelector("[new-search]")
if(newSearch){
  const url = new URL(window.location.href)
  newSearch.addEventListener("keyup",(event)=>{
    const value = newSearch.value
    if(event.code=="Enter"){
      if(value)
        url.searchParams.set("keyword",value.trim())
      else  
        url.searchParams.delete("keyword")
      window.location.href = url.href
    }
  })
  const currentValue = url.searchParams.get("keyword")
  if(currentValue) newSearch.value = currentValue
}
//End new search

//pagination new
const newPage = document.querySelector("[new-page]")
if(newPage){
  const url = new URL(window.location.href)
  newPage.addEventListener("change",()=>{
    const value = newPage.value
    if(value){
      url.searchParams.set("page",value)
    }
    else{
      url.searchParams.delete("page")
    }
    window.location.href = url.href
  })
  const currentValue = url.searchParams.get("page")
  const totalHtml = document.querySelector("[total]")
  const total = totalHtml.getAttribute("total")
  console.log(total)
  if(currentValue){
    if(currentValue>total){
      newPage.value = total
    }
    else if(currentValue<=0){
      newPage.value = 1
    }
    else{
      newPage.value= currentValue
    }
  }
}
//End pagination new

//button delete new
const buttonDeletenews = document.querySelectorAll("[button-delete-new]")
if(buttonDeletenews){  
  buttonDeletenews.forEach(buttonDeletenew => {
    buttonDeletenew.addEventListener("click",()=>{
    const api= buttonDeletenew.getAttribute("button-delete-new")
    fetch(api,{
      method:"PATCH"
    })
    .then(res=>res.json())
    .then(data=>{
      if(data.code=="error"){
        alert(data.message)
      }
      else{
        window.location.reload()
      }
    })
    })
  });
}
//End button delete new
//End----------Filter new

//--------book trash
//check-all-trash
const checkAllTrash = document.querySelector("[checkAllTrash]")
if(checkAllTrash){
  checkAllTrash.addEventListener("click",()=>{
    const checkItemTrash = document.querySelectorAll("[checkItemTrash]")
    checkItemTrash.forEach(item=>{
      item.checked = checkAllTrash.checked
    })
  })
}
//End check-all-trash

//trash search
const trashSearch = document.querySelector("[trashSearch]")
if(trashSearch){
  const url = new URL(window.location.href)
  trashSearch.addEventListener("keyup",(event)=>{
    if(event.code=="Enter"){
      if(trashSearch.value){
      url.searchParams.set("keyword",trashSearch.value)
      }
      else{
        url.searchParams.delete("keyword")
      }
      window.location.href = url.href
    }
  })
  const currentValue = url.searchParams.get("keyword")
  if(currentValue) trashSearch.value = currentValue
}
//End trash search

//button-restore-trash
const buttonRestoreTrashs = document.querySelectorAll("[button-restore-trash]")
if(buttonRestoreTrashs){
    buttonRestoreTrashs.forEach(buttonRestoreTrash => {
    buttonRestoreTrash.addEventListener("click",()=>{
    const api = buttonRestoreTrash.getAttribute("api-restore")
    fetch(api,{
      method:"PATCH"
    })
    .then(res=>res.json())
    .then(data=>{
      if(data.code=="error"){
        alert(data.message)
      }
      else{
        window.location.reload()
      }
    })
  })
  });
}
//End button-restore-trash

//button-destroy-trash
const buttondestroyTrashs = document.querySelectorAll("[button-destroy-trash]")
if(buttondestroyTrashs){
  buttondestroyTrashs.forEach(buttondestroyTrash => {
    buttondestroyTrash.addEventListener("click",()=>{
    const api = buttondestroyTrash.getAttribute("api-destroy")
    fetch(api,{
      method:"PATCH"
    })
    .then(res=>res.json())
    .then(data=>{
      if(data.code=="error"){
        alert(data.message)
      }
      else{
        window.location.reload()
      }
    })
  })
  });
}
//End button-destroy-trash

//status trash
const changeStatusTrash = document.querySelector("[change-status-trash]")
if(changeStatusTrash){
  const select = changeStatusTrash.querySelector("select")
  const button = changeStatusTrash.querySelector("button")
  button.addEventListener("click",()=>{
    const value = select.value
    const ids=[]
    const checkItemTrash = document.querySelectorAll("[checkItemTrash]:checked")
    checkItemTrash.forEach(item => {
      const id = item.getAttribute("checkItemTrash")
      ids.push(id)
    });
    if(value){
      const dataFinal = {
        status:value,
        ids:ids
      }
      fetch(`/${pathAdmin}/book/trash`,{
        method:"PATCH",
        headers:{
          "Content-type":"application/json"
        },
        body:JSON.stringify(dataFinal)
      })
      .then(res=>res.json())
      .then(data=>{
        if(data.code=="error"){
          alert(data.message)
        }
        else{
          window.location.reload()
        }
      })
    }
  })
}
//end status trash

//End book trash

//------------Filter Contact
//Filter startDate Contact
const filterstartDateContact = document.querySelector("[filter-startDate-contact]");
if(filterstartDateContact){
  const url = new URL(window.location.href)
  filterstartDateContact.addEventListener("change",()=>{
    const value = filterstartDateContact.value;
    if(value){
      url.searchParams.set("startdate",value);
    }
    else{
      url.searchParams.delete("startdate")
    }
    window.location.href = url
  })
  const currentValue = url.searchParams.get("startdate")
  if(currentValue) filterstartDateContact.value = currentValue
}
//end Filter startDate contact

//Filter EndDate contact
const filterEndDateContact = document.querySelector("[filter-endDate-contact]");
if(filterEndDateContact){
  const url = new URL(window.location.href)
  filterEndDateContact.addEventListener("change",()=>{
    const value = filterEndDateContact.value;
    if(value){
      url.searchParams.set("enddate",value);
    }
    else{
      url.searchParams.delete("enddate")
    }
    window.location.href = url
  })
  const currentValue = url.searchParams.get("enddate")
  if(currentValue) filterEndDateContact.value = currentValue
}
//end Filter EndDate contact

//Filter delete contact
const filerDeleteContact = document.querySelector("[filter-delete-contact]")
if(filerDeleteContact){
  const url = new URL(window.location.href)
  filerDeleteContact.addEventListener("click",()=>{
    url.search= ""
    window.location.href = url
  })
}
//End Filter delete contact

//Check All contact
const checkAllContact = document.querySelector("[checkAll]")
if(checkAll){
  checkAll.addEventListener("click",()=>{
    const checkItem = document.querySelectorAll("[checkItem]")
    checkItem.forEach(item => {
      item.checked = checkAll.checked
    });
  })
} 
//End Check All contact 

//Change status contact
const changeStatusContact = document.querySelector("[change-status-contact]")
if(changeStatusContact){
  const select = changeStatusContact.querySelector("select")
  const button = changeStatusContact.querySelector("button")
  if(button){
    button.addEventListener("click",()=>{
      const ids= []
      const itemChecked = document.querySelectorAll("[checkItem]:checked")
      itemChecked.forEach(item=> {
        const id = item.getAttribute("checkItem")
        ids.push(id)
      })
      const status = select.value
      if(status && ids.length>0){
        const dataFinal = {
          status:status,
          ids: ids
        }
        
        fetch(`/${pathAdmin}/contact/changePatch`,{
          method:"PATCH",
          headers:{
            "Content-type":"application/json"
          },
          body: JSON.stringify(dataFinal)
        })
        .then(res=>res.json())
        .then(data=>{
          if(data.code=="error")
            alert(data.message)
          else
            window.location.reload()
        })
      }

    })
  }
}
//End change status contact

//search contact
const searchContact = document.querySelector("[search-contact]")
if(searchContact){
  const url = new URL(window.location.href)
  searchContact.addEventListener("keyup",(event)=>{
    if(event.code == "Enter"){
      const value = searchContact.value
      if(value){
        url.searchParams.set("keyword",value.trim())
      }
      else{
        url.searchParams.delete("keyword")
      }
      window.location.href = url.href
    }  
  })
  const currentSearch = url.searchParams.get("keyword")
  if(currentSearch){
    searchContact.value = currentSearch
  }
}
//End search tour

//pagination
const innerPaginationContact = document.querySelector("[pagination-contact]")
if(innerPaginationContact){
  const url = new URL(window.location.href)
  innerPaginationContact.addEventListener("change",()=>{
    const value = innerPaginationContact.value
    if(value){
      url.searchParams.set("page",value)
    }
    else{
      url.searchParams.delete("page")
    }
    window.location.href = url.href 
  })
  const currentPage = url.searchParams.get("page")
  if(currentPage) innerPaginationContact.value = currentPage
}
//End pagination contact

//delete contact item
const apiDelete = document.querySelectorAll("[api-delete]")
if(apiDelete){
  apiDelete.forEach(button=>{
    button.addEventListener("click",()=>{
      const api = button.getAttribute("api-delete")
      fetch(api,{
        method:"PATCH"
      })
      .then(res=>res.json())
      .then(data=>{
        if(data.code=="error"){
          alert(data.message)
        }
        else{
          window.location.reload()
        }
      })
    })
  })
}
//end delete contact item
//End----------Filter contact



//filter order

//status
const orderStatus = document.querySelector("[order-status]")
if(orderStatus){
  const url = new URL(window.location.href)
  orderStatus.addEventListener("change",()=>{
    if(orderStatus.value){
      url.searchParams.set("status",orderStatus.value)
    }
    else{
      url.searchParams.delete("status")
    }
    window.location.href = url.href
  })
  const current = url.searchParams.get("status")
  if(current){
    orderStatus.value= current
  }
}
//end status

//date
const orderStartDate = document.querySelector("[order-startDate]")
if(orderStartDate){
  const url = new URL(window.location.href)
  orderStartDate.addEventListener("change",()=>{
    if(orderStartDate.value){
      url.searchParams.set("startDate",orderStartDate.value)
    }
    else{
      url.searchParams.delete("startDate")
    }
    window.location.href = url.href
  })
  const current = url.searchParams.get("startDate")
  if(current){
    orderStartDate.value= current
  }
}

const orderEndDate = document.querySelector("[order-endDate]")
if(orderEndDate){
  const url = new URL(window.location.href)
  orderEndDate.addEventListener("change",()=>{
    if(orderEndDate.value){
      url.searchParams.set("endDate",orderEndDate.value)
    }
    else{
      url.searchParams.delete("endDate")
    }
    window.location.href = url.href
  })
  const current = url.searchParams.get("endDate")
  if(current){
    orderStartDate.value= current
  }
}
//End date

//method
const orderMethod = document.querySelector("[order-method]")
if(orderMethod){
  const url = new URL(window.location.href)
  orderMethod.addEventListener("change",()=>{
    if(orderMethod.value){
      url.searchParams.set("method",orderMethod.value)
    }
    else{
      url.searchParams.delete("method")
    }
    window.location.href = url.href
  })
  const current = url.searchParams.get("method")
  if(current){
    orderMethod.value= current
  }
}
//End method

//status pay
const orderStatusPay = document.querySelector("[order-statusPay]")
if(orderStatusPay){
  const url = new URL(window.location.href)
  orderStatusPay.addEventListener("change",()=>{
    if(orderStatusPay.value){
      url.searchParams.set("statusPay",orderStatusPay.value)
    }
    else{
      url.searchParams.delete("statusPay")
    }
    window.location.href = url.href
  })
  const current = url.searchParams.get("statusPay")
  if(current){
    orderStatusPay.value= current
  }
}
//end status pay

//delete filter
const orderDeleteFilter = document.querySelector("[order-delete-filter]")
if(orderDeleteFilter){
  const url = new URL(window.location.href)
  orderDeleteFilter.addEventListener("click",()=>{
    url.search = ""
    window.location.href = url.href
  })
}
//End delete filter

const orderSearch = document.querySelector("[order-search]")
if(orderSearch){
  const url = new URL(window.location.href)
  orderSearch.addEventListener("keyup",(event)=>{
    if(event.code=="Enter"){
      if(orderSearch.value){
        url.searchParams.set("keyword",orderSearch.value)
      }
      else{
        url.searchParams.delete("keyword")
      }
      window.location.href = url.href
    }
  })
  const current = url.searchParams.get("keyword")
  if(current){
    orderSearch.value= current
  }
}
//End filter order


// event Create Form
const eventCreateForm = document.querySelector("#event-create-form");
if(eventCreateForm) {
  const validation = new JustValidate('#event-create-form');
  validation
    .addField('#name', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên sự kiện!'
      }
    ])
    .addField('#startDate', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng chọn ngày bắt đầu!'
      }
    ])
    .addField('#endDate', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng chọn ngày kết thúc!'
      },
      {
        validator: (value, fields) => {
          if (!fields['#startDate'] || !fields['#startDate'].elem.value) {
            return true; 
          }
          const start = new Date(fields['#startDate'].elem.value);
          const end = new Date(value);
          return end >= start;
        },
        errorMessage: 'Ngày kết thúc sự kiện không hợp lệ!'
      }
    ])
    .onSuccess((event) => {
      const name = event.target.name.value;
      const discount = event.target.discount.value;
      const avatars = filePond.avatar.getFiles();
      const startDate = event.target.startDate.value;
      const endDate = event.target.endDate.value;
      const status = event.target.status.value;
      let avatar = null;
      if(avatars.length > 0) {
        avatar = avatars[0].file;
      }
      const information = tinymce.get("information").getContent();
      const formData = new FormData()
      formData.append("name",name)
      formData.append("discount",discount)
      formData.append("avatar",avatar)
      formData.append("startDate",startDate)
      formData.append("endDate",endDate)
      formData.append("status", status);
      formData.append("information",information)
      fetch(`/${pathAdmin}/event/create`,{
        method:"POST",
        body: formData
      }).
      then(res=>res.json()).
      then(data=>{
        if(data.code=="error"){
          alert(data.message)
        }
        else{
          window.location.href=`/${pathAdmin}/event/list`
        }
      })
    })
  ;
}
// End event Create Form
// event Edit Form
const eventEditForm = document.querySelector("#event-edit-form");
if(eventEditForm) {
  const validation = new JustValidate('#event-edit-form');
  validation
    .addField('#name', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên sự kiện!'
      }
    ])
    .addField('#startDate', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng chọn ngày bắt đầu!'
      }
    ])
    .addField('#endDate', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng chọn ngày kết thúc!'
      },
      {
        validator: (value, fields) => {
          if (!fields['#startDate'] || !fields['#startDate'].elem.value) {
            return true; 
          }
          const start = new Date(fields['#startDate'].elem.value);
          const end = new Date(value);
          return end >= start;
        },
        errorMessage: 'Ngày kết thúc sự kiện không hợp lệ!'
      }
    ])
    .onSuccess((event) => {
      const id = event.target.id.value;
      const name = event.target.name.value;
      const discount = event.target.discount.value;
      const startDate = event.target.startDate.value;
      const endDate = event.target.endDate.value;
      const status = event.target.status.value;
      let avatar = null;
      const avatars = filePond.avatar.getFiles();
      if(avatars.length > 0) {
        avatar= avatars[0].file;
        const elementImageDefault = event.target.avatar.closest("[image-default]");
        if(elementImageDefault){
          const imageDefault = elementImageDefault.getAttribute("image-default");
          if(imageDefault.includes(avatar.name)) {
            avatar=null
          }
        }
      }
      const information = tinymce.get("information").getContent();
      const formData = new FormData()
      formData.append("name",name)
      formData.append("discount",discount)
      formData.append("avatar",avatar)
      formData.append("startDate",startDate)
      formData.append("endDate",endDate)
      formData.append("status", status);
      formData.append("information",information)
      fetch(`/${pathAdmin}/event/edit/${id}`,{
        method:"PATCH",
        body: formData
      }).
      then(res=>res.json()).
      then(data=>{
        if(data.code=="error"){
          alert(data.message)
        }
        else{
          window.location.reload()
        }
      })
    })
  ;
}
// End event edit Form

//button delete event
const buttonDeleteEvents = document.querySelectorAll("[button-delete-event]")
if(buttonDeleteEvents){  
  buttonDeleteEvents.forEach(buttonDeleteEvent => {
    buttonDeleteEvent.addEventListener("click",()=>{
    const api= buttonDeleteEvent.getAttribute("button-delete-event")
    fetch(api,{
      method:"PATCH"
    })
    .then(res=>res.json())
    .then(data=>{
      if(data.code=="error"){
        alert(data.message)
      }
      else{
        window.location.reload()
      }
    })
    })
  });
}
//End button delete event

// Biểu đồ doanh thu
const revenueChart = document.querySelector("#revenue-chart");
let revenueChartInstance = null;
const drawChart = (now)=>{
  const currentMonth = now.getMonth()+1
  const currentYear = now.getFullYear()

  const previousMonthDate = new Date(currentYear, now.getMonth()-1,1)
  const previousMonth = previousMonthDate.getMonth()+1
  const previousYear = previousMonthDate.getFullYear()

  const daysInMonthCurrent = new Date(currentYear,currentMonth,0).getDate()
  const daysInMonthPrevious = new Date(previousYear,previousMonth,0).getDate()
  const days = daysInMonthCurrent>daysInMonthPrevious? daysInMonthCurrent :daysInMonthPrevious
  const arrayDay =[]
  for(let i=1;i<=days;i++){
    arrayDay.push(i)
  }
  const dataFinal ={
    currentMonth,
    currentYear,
    previousMonth,
    previousYear,
    arrayDay
  }
  fetch(`/${pathAdmin}/dashboard/revenueChart`,{
    method:"POST",
    headers:{
      "Content-type":"application/json"
    },
    body:JSON.stringify(dataFinal)
  })
  .then(res=>res.json())
  .then(data=>{
    if(data.code=="error"){
      alert(data.message)
    }
    else{
      if (revenueChartInstance) {
        revenueChartInstance.destroy();
      }
      revenueChartInstance =new Chart(revenueChart, {
        type: 'line',
        data: {
          labels: arrayDay,
          datasets: [
            {
              label: `Tháng ${currentMonth}/${currentYear}`, 
              data: data.dataMonthCurrent, 
              borderColor: '#4379EE', 
              borderWidth: 1.5, 
            },
            {
              label: `Tháng ${previousMonth}/${previousYear}`, 
              data: data.dataMonthPrevious , 
              borderColor: '#EF3826', 
              borderWidth: 1.5, 
            }
          ]
        },
        options: {
          plugins: {
            legend: {
              position: 'bottom'
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Ngày'
              },
              ticks: {
                maxRotation: 0,
                minRotation: 0,
              }
            },
            y: {
              title: {
                display: true,
                text: 'Doanh thu (VND)'
              }
            }
          },
          maintainAspectRatio: false, 
        }
      });
    }
  })
}
if(revenueChart) {
  const chartInput = document.querySelector("[chart]")
  if(chartInput){
    chartInput.addEventListener("change",()=>{
      console.log(chartInput.value)
      let now = new Date(chartInput.value)
      drawChart(now)
    })
  }

  let now = new Date()
  drawChart(now)
}
// Hết Biểu đồ doanh thu

//inventory
const inventories = document.querySelectorAll("[inventory-id]")
if(inventories){
  inventories.forEach(inventory=>{
    inventory.addEventListener("click",()=>{
      const url = new URL(window.location.href)
      let value = inventory.getAttribute("inventory-id")
      if(value){
        url.searchParams.set("category",value)
      }
      else{
        url.searchParams.delete("category")
      }
      window.location.href = url.href
    })
  })
}
let inventoryChartInstance = null;
const drawInventoryChart = (data) => {
  const inventoryCtx = document.getElementById('inventoryChart').getContext('2d');
  const labels = data.result.map(c => c.name);
  console.log(data.result)
  const dataCounts = data.result.map(c => c.count);
  const colors = labels.map(() => 
    `rgba(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, 0.6)`
  );

  if (inventoryChartInstance) {
    inventoryChartInstance.destroy();
  }
  inventoryChartInstance = new Chart(inventoryCtx, {
    type: 'bar', 
    data: {
      labels: labels,
      datasets: [{
        label: 'Số lượng tồn kho',
        data: dataCounts,
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.6','1')),
        borderWidth: 1
      }]
    },
    options: {
      responsive: false, 
      plugins: {
        legend: { position: 'bottom' }
      },
      scales: {
        x: { 
          title: { display: true, text: 'Thể loại' },
          ticks: {
            maxRotation: 0,
            minRotation: 0,
            autoSkip: false 
          }
        },
        y: { 
          title: { display: true, text: 'Số lượng tồn kho' },
          beginAtZero: true
        }
      },
      maintainAspectRatio: false
    }
  });
};
const inventoryCtx = document.getElementById('inventoryChart')
if(inventoryCtx){
  const inventoryCategory = url.searchParams.get("category");
  if(inventoryCtx.getContext('2d')){
    fetch(`/${pathAdmin}/dashboard/inventory?category=${inventoryCategory?inventoryCategory:"6825e6759800453576be8447"}`, {
      method: "GET",
      headers: { "Content-type": "application/json" }
    })
    .then(res => res.json())
    .then(data => {
      if(data.code === "error"){
        alert(data.message);
      } else {
        drawInventoryChart(data);
      }
    });
  }
}
//end inventory

//circle
let inventoryStatusChartInstance = null;
const drawInventoryStatusChart = ({almostOver, many, soldOut}) => {
  const ctx = document.getElementById('inventoryStatusChart').getContext('2d');

  const labels = ['Sắp hết', 'Nhiều', 'Hết hàng'];
  const dataCounts = [almostOver, many, soldOut];

  const colors = [
    'rgba(232, 150, 7, 0.85)',   
    'rgba(54, 162, 235, 0.6)',   
    'rgba(211, 8, 8, 0.93)'    
  ];

  if (inventoryStatusChartInstance) inventoryStatusChartInstance.destroy();

  inventoryStatusChartInstance = new Chart(ctx, {
    type: 'pie', 
    data: {
      labels: labels,
      datasets: [{
        data: dataCounts,
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.6','1')),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom',
          labels: {
            padding: 20 
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a,b)=>a+b,0);
              const value = context.raw;
              const percent = ((value/total)*100).toFixed(1);
              return `${context.label}: ${value} (${percent}%)`;
            }
          }
        }
      },
      maintainAspectRatio: false,
      animation: {
        onComplete: function() {
          const chart = this;
          const ctx = chart.ctx;
          ctx.font = 'bold 14px sans-serif';
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const dataset = chart.data.datasets[0];
          const total = dataset.data.reduce((a,b)=>a+b,0);
          
          const meta = chart.getDatasetMeta(0);
          meta.data.forEach((arc,index)=>{
            const value = dataset.data[index];
            const percent = ((value/total)*100).toFixed(1) + '%';
            const pos = arc.getCenterPoint();
            ctx.fillText(percent, pos.x, pos.y);
          });
        }
      }
    }
  });
};
const almostOver = document.getElementById("data-almostOver")
const soldOut = document.getElementById("data-soldOut")
const many = document.getElementById("data-many")
if(almostOver&&soldOut&&many){
  drawInventoryStatusChart({
    almostOver: Number(almostOver.dataset.value),
    soldOut: Number(soldOut.dataset.value),
    many: Number(many.dataset.value)
  });
}
//end circle

//tat scroll tang giam 
const numberInput = document.querySelector("#numberBook");
if(numberInput){
  numberInput.addEventListener("wheel", (e) => {
    e.preventDefault();
});
}
const priceInput = document.querySelector("#priceBook");
if(priceInput){
  priceInput.addEventListener("wheel", (e) => {
    e.preventDefault();
});
}
const positionInput = document.querySelector("#position");
if(positionInput){
  positionInput.addEventListener("wheel", (e) => {
    e.preventDefault();
});
}