import React, { useRef, useState, useEffect } from 'react';
import styles from '../../styles/CartBag.module.css';
import Link from 'next/link';
import Image from 'next/image'

import { Client } from '../../graphql/client';
import { getFormattedCurrency, getFilePath } from '../../components/ConfigureProduct';
import { useRouter } from 'next/router';

function CartBag({ toggleCartBag, updateCartCount }: any) {
  const client = new Client();
  const [couponCode, setCouponCode] = useState<any>('');
  const wrapperRef = useRef<any>(null);
  const router = useRouter()
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        toggleCartBag()
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [formKey, setformKey] = useState<any>([]);
  const [loaded, setLoaded] = useState<any>(false);
  const [cartSubTotal, setCartSubTotal] = useState<any>([]);

  useEffect(() => {
    fetchCartItems()
  }, []);

  function handleShopRedirect() {
    router.push('/mens-diabetic-shoes')

    setTimeout(() => {
      toggleCartBag()
    }, 2000);
  }

  const fetchCartItems = async () => {
    try {
      const response = await fetch(`${process.env.baseURL}fcprofile/sync/index`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();

        if (data) {
          let cartItemsList = [];

          // Collect promises for item details
          const itemPromises = data.cart_items.map(async (item: any) => {
            let newItem = { ...item };
            let itemDetail: any = await getProductDetails(item);

            if (itemDetail) {
              newItem['name'] = itemDetail.name;
              newItem['sku'] = itemDetail.sku;
              newItem['image_url'] = itemDetail.image.url;
            }
            return newItem;
          });

          // Wait for all item detail promises to resolve
          cartItemsList = await Promise.all(itemPromises);

          // Update state after all items are processed
          setCartItems(cartItemsList);
          updateCartCount(data.cart_qty);
          setformKey(data.form_key);
        }
      } else {
        updateCartCount(0);
      }
    } catch (err) {
      updateCartCount(0);
    } finally {
      // ✅ only mark as loaded once everything is done
      setLoaded(true);
    }
  };


  const getProductDetails = (item: any) => {
    try {
      return new Promise(async (resolve) => {
        //console.log('fetchProductBySKU')
        const product = await client.fetchProductBySKU(item.sku);
        let productData = product.data.products.items
        return resolve(productData[0])
        // return resolve({
        //   "sku": "ROLEX-DJTTJBGMOPDND",
        //   "name": "Rolex Oyster Perpetual Datejust Natural Diamond Green Mother of Pearl Dial Two-Tone Jubilee Bracelet Watch",
        //   "image": {
        //     "url": `${process.env.baseURLWithoutTrailingSlash}/media/catalog/product/cache/859b52c65b2723b9b197f216b7f37838/2/0/2024_1215_rolex-pearlgreen_1.jpg`
        //   }
        // });
      })
    } catch (err) {
      return ''
    }

  }




  useEffect(() => {
    let subtotal = 0
    cartItems.forEach((item: any) => {
      let qty = item.qty ? item.qty : 1
      let price = item.price
      let total = price * qty
      subtotal = subtotal + total
    })
    setCartSubTotal(subtotal)
  }, [cartItems]);

  const deleteItem = async (cartItem: any) => {

    if (typeof document !== 'undefined') {
      const element = document.getElementById(cartItem.item_id);
      if (element) {
        element.classList.add('cart_item_deleted')
      }
    }

    try {
      const response = await fetch(`${process.env.baseURL}fcprofile/cart/next`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entity_id: parseInt(cartItem.entity_id),
          form_key: formKey, // Use the form_key from cookies or the fetched one
        }),
      });

      if (response.ok) {
        fetchCartItems()
      }
    } catch (err: any) {

    }
  }


  const incrementQuantity = (cartItem: any) => {

    let newCartItems: any = []
    cartItems.forEach((item: any, index: any) => {
      if (item.item_id != cartItem.item_id) {
        newCartItems.push(item)
      } else {
        let prevQuantity = cartItem.qty ? cartItem.qty : 1
        cartItem['qty'] = Math.min(prevQuantity + 1, 100);
        newCartItems.push(cartItem)
      }
    })
    setCartItems(newCartItems)

  };

  const decrementQuantity = (cartItem: any) => {

    let newCartItems: any = []
    cartItems.forEach((item: any, index: any) => {
      if (item.item_id != cartItem.item_id) {
        newCartItems.push(item)
      } else {
        let prevQuantity = cartItem.qty ? cartItem.qty : 1
        let newQty = Math.min(prevQuantity - 1, 100)
        cartItem['qty'] = newQty > 0 ? newQty : 1;
        newCartItems.push(cartItem)
      }
    })
    setCartItems(newCartItems)

  };

  const handleQuantityChange = (e: any, cartItem: any) => {


    let newCartItems: any = []
    cartItems.forEach((item: any, index: any) => {
      if (item.item_id != cartItem.item_id) {
        newCartItems.push(item)
      } else {
        const value = Math.max(1, Math.min(100, Number(e.target.value)));
        cartItem['qty'] = value
        newCartItems.push(cartItem)
      }
    })
    setCartItems(newCartItems)
  };

  const handleCouponCode = (e: any) => {
    setCouponCode(e.target.value);
  };

  if (loaded) {
    return (
      <div className={styles.cart_bag_outer}>
        <div ref={wrapperRef} className={styles.cart_bag}>
          <div className={styles.cart_bag_close} >
            <h3>View Your Cart</h3>
            <Image onClick={toggleCartBag} width={25} height={25} src={'/Images/cross-23-32.png'} alt="Close Modal" />
          </div>
          {cartItems && cartItems.length > 0 ? <>
            <div className={styles.cart_bag_content}>
              {cartItems.map((item: any, index: any) => (
                <div className={styles.cart_item} key={'cart_' + index} id={item.item_id}>
                  <div className={styles.item_thumbnail}>

                    {item.image_url && <Link href={item.url_key} >
                      <Image width={200} height={200} src={`${item.image_url ? item.image_url.includes("cache") ? item.image_url.replace(/\/cache\/.*?\//, "/") : item.image_url : ""}`} alt={item.name} />
                    </Link>}
                  </div>
                  <div className={styles.item_detail}>
                    <p><Link href={item.url_key} >{item.name}</Link></p>
                    <p><b>SKU:</b> {item?.sku}</p>
                    <p><b>Quantity:</b> {item?.qty ? item?.qty : 1}</p>
                    <div className={styles.customQuantityPrice}>
                      <p></p>
                      <p><b>{getFormattedCurrency(item.price * (item.qty ? item.qty : 1))}</b></p>
                    </div>

                  </div>
                  <span onClick={(e) => deleteItem(item)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </span>
                </div>
              ))}

            </div>
            <div className={styles.cart_bag_footer}>
              <div className={styles.couponCode}>
                {/* <input
                    type="text"
                    value={couponCode}
                    onChange={(e)=>handleCouponCode(e)}
                    placeholder='Discount Coupon'
                    className={styles.couponCodeInput}
                  />
                  <button className={styles.couponCodeButton}>Apply</button> */}

              </div>

              <div className={styles.subtotalSection}>
                <p>Subtotal</p>
                <p>{getFormattedCurrency(cartSubTotal)} </p>
              </div>
              <div className={styles.buttonSection}>
                <p><span>Taxes and shipping calculated at checkout</span></p>
                <button onClick={() => { window.location.href = process.env.baseURL + 'checkout/' }} className={styles.buyNow}>CHECK OUT</button>
                <p onClick={toggleCartBag} >Or</p>
                <div onClick={() => { window.location.href = process.env.baseURL + 'checkout/cart/' }} className={styles.buyNowLink}>View cart details</div>
              </div>
            </div></> : <>
            <div className={styles.cart_empty}>
              <div className={styles.cart_empty_inner}>
                <Image
                  src="/Images/emptyCart.png" // Replace with your empty cart image URL
                  alt="Empty Cart"
                  width={150}
                  height={150}
                />
                <h3>Your Cart is Empty</h3>
                <p>Add some items to your cart to see them here.</p>

                <button onClick={handleShopRedirect} className={styles.shop_button}>Start Shopping</button>
                {/* You have no items in your shopping cart. */}
              </div>
            </div>
          </>}


        </div>
      </div>
    );
  } else {
    return (
      <div className={styles.cart_bag_outer}>
        <div ref={wrapperRef} className={styles.cart_bag}>
          <div className={styles.cart_bag_close} >
            <h3>View Your Cart</h3>
            <Image onClick={toggleCartBag} width={25} height={25} src={'/Images/cross-23-32.png'} alt="Close Modal" /></div>

          <div className={styles.cart_bag_empyty}>
            Loading...
          </div>


        </div>
      </div>
    );
  }
}

export default CartBag;