import React, { useRef, useState, useEffect } from 'react';
// import './CartBag.css';
import Link from 'next/link';
import Image from 'next/image';
import { Client } from '../../graphql/client';
import { getFormattedCurrency, getFilePath } from '../../components/ConfigureProduct';
import { useRouter } from 'next/router';
import styles from '../../styles/CartBag.module.css';

function CartBag({ toggleCartBag, updateCartCount }: any) {
  const client = new Client();
  const [couponCode, setCouponCode] = useState('');
  const [deliveryRange, setDeliveryRange] = useState("");
  const [cartCount, setCartCount] = useState<any>(0);


  const wrapperRef = useRef<any>(null);
  const router = useRouter();


  function handleStorageChange() {
    let newcartCount: any = localStorage.getItem("cartCount")
      ? localStorage.getItem("cartCount")
      : 0;
    let newwshowcartBag: any = localStorage.getItem("showcartBag")
      ? localStorage.getItem("showcartBag")
      : "false";

    if (parseInt(newcartCount) > 0) {
      setCartCount(parseInt(newcartCount));
      if (newwshowcartBag == "true") {
        localStorage.setItem("showcartBag", "false");
        // setShowCartBag(true);
      }
    }
  }


  useEffect(() => {
    handleStorageChange()
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

  const [cartItems, setCartItems] = useState([
    //    {
    //   "sku": "ROLEX-DJTTJBGMOPDND",
    //   "name": "Rolex Oyster Perpetual Datejust Natural Diamond Green Mother of Pearl Dial Two-Tone Jubilee Bracelet Watch",
    //   "image_url": `https://tlx.ocodecommerce.com/media/catalog/product/6/6/66631bdd1d7883058b6c2cfe.jpg`,
    //   "item_detail": "ABC",
    //   "url_key": "BAC",
    //   "price": "100"
    // },
    // {
    //   "sku": "ROLEX-DJTTJBGMOPDND",
    //   "name": "Rolex Oyster Perpetual Datejust Natural Diamond Green Mother of Pearl Dial Two-Tone Jubilee Bracelet Watch",
    //   "image_url": `https://tlx.ocodecommerce.com/media/catalog/product/6/6/66631bdd1d7883058b6c2cfe.jpg`,
    //   "item_detail": "ABC",
    //   "url_key": "BAC",
    //   "price": "200"
    // },
    // {
    //   "sku": "ROLEX-DJTTJBGMOPDND",
    //   "name": "Rolex Oyster Perpetual Datejust Natural Diamond Green Mother of Pearl Dial Two-Tone Jubilee Bracelet Watch",
    //   "image_url": `https://tlx.ocodecommerce.com/media/catalog/product/6/6/66631bdd1d7883058b6c2cfe.jpg`,
    //   "item_detail": "ABC",
    //   "url_key": "BAC",
    //   "price": "100"
    // },
    // {
    //   "sku": "ROLEX-DJTTJBGMOPDND",
    //   "name": "Rolex Oyster Perpetual Datejust Natural Diamond Green Mother of Pearl Dial Two-Tone Jubilee Bracelet Watch",
    //   "image_url": `https://tlx.ocodecommerce.com/media/catalog/product/6/6/66631bdd1d7883058b6c2cfe.jpg`,
    //   "item_detail": "ABC",
    //   "url_key": "BAC",
    //   "price": "200"
    // }
  ]);
  const [formKey, setFormKey] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [cartSubTotal, setCartSubTotal] = useState([]);

  useEffect(() => {
    fetchCartItems();
  }, []);


  useEffect(() => {
    const today = new Date();

    const addDays = (days:any) => {
      const date = new Date(today);
      date.setDate(date.getDate() + days);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
    };

    const from = addDays(3);
    const to = addDays(11);
    setDeliveryRange(`${from} - ${to}`);
  }, []);

  function handleShopRedirect() {
    router.push('/');
    setTimeout(() => {
      toggleCartBag();
    }, 2000);
  }

  const fetchCartItems = async () => {
    try {
      const response = await fetch(`${process.env.baseURL}fcprofile/sync/index`, {
        method: "GET",
      });

      if (response.ok) {
        setLoaded(true);
        const data = await response.json();

        if (data) {
          console.log(data,"DATA URLKEY")
          let cartItemsList:any = [];
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

          cartItemsList = await Promise.all(itemPromises);
          setCartItems(cartItemsList);
          updateCartCount(data.cart_qty);
          setFormKey(data.form_key);
        }
      }
    } catch (err) {
      setLoaded(true);
      updateCartCount(0);
    }
  };

  const getProductDetails = (item: any) => {
    try {
      return new Promise(async (resolve) => {
        const product = await client.fetchProductBySKU(item.sku);
        let productData = product.data.products.items;
        return resolve(productData[0]);
      });
    } catch (err) {
      return '';
    }
  };

  useEffect(() => {
    let subtotal:any = 0;
    cartItems.forEach((item: any) => {
      let qty = item.qty ? item.qty : 1;
      let price = item.price;
      let total = price * qty;
      subtotal = subtotal + total;
    });
    setCartSubTotal(subtotal);
  }, [cartItems]);

  const deleteItem = async (cartItem: any) => {
    if (typeof document !== 'undefined') {
      const element = document.getElementById(cartItem.item_id);
      if (element) {
        element.classList.add('cart_item_deleted');
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
          form_key: formKey,
        }),
      });

      if (response.ok) {
        fetchCartItems();
      }
    } catch (err) {}
  };

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
          <div className={styles.cart_bag_close}>
        
            <Image onClick={toggleCartBag} width={24} height={24} src="/Images/cross-23-32.png" alt="Close Cart" />
            <h3>My Cart</h3>

            <span className={styles.icon} onClick={toggleCartBag}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon-icon-_rq"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              {parseInt(cartCount) > 0 && (
                <span className={styles.cartCountNumber}>{cartCount}</span>
              )}
            </span>

          </div>
          {cartItems && cartItems.length > 0 ? (
            <>
              <div className={styles.cart_bag_content}>
                {cartItems.map((item:any, index:any) => (
                  <div className={styles.cart_item_outer} key={'cart_' + index} id={item.item_id}>
                  <div className={styles.cart_item} >

                    <div className={styles.item_thumbnail}>
                      {item.image_url && (
                        <Link href={`/${item.url_key.replace('/product', '')}`}>
                          <Image
                            width={120}
                            height={120}
                            src={`${item.image_url ? item.image_url.includes("cache") ? item.image_url.replace(/\/cache\/.*?\//, "/") : item.image_url : ""}`}
                            alt={item.name}
                            className={styles.item_image}
                          />
                        </Link>
                      )}
                    </div>
                    <div className={styles.item_detail}>
                      <Link href={item.url_key.replace('/product', '')} className={styles.item_name}>{item.name}</Link>
                      <p className={styles.item_sku}><strong>SKU:</strong> {item.sku}</p>




                    </div>

                    <span className={styles.delete_icon} onClick={() => deleteItem(item)}>
                                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            <line x1="10" y1="11" x2="10" y2="17"></line>
                                            <line x1="14" y1="11" x2="14" y2="17"></line>
                                          </svg>
                                        </span>


                  </div>

                    <div className={styles.comboPriceQua}>
                    <div className={styles.custom_quantity}>
                    <p><b>Quantity:</b> {item?.qty ? item?.qty : 1}</p>
                    {/* <span className={styles.delete_icon} onClick={() => deleteItem(item)}>
                                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            <line x1="10" y1="11" x2="10" y2="17"></line>
                                            <line x1="14" y1="11" x2="14" y2="17"></line>
                                          </svg>
                                        </span> */}


                      {/* <button className={styles.decrement_button} onClick={() => decrementQuantity(item)}>-</button> */}
                      {/* <input
                        type="number"
                        value={item.qty ? item.qty : 1}
                        onChange={(e) => handleQuantityChange(e, item)}
                        className={styles.quantity_input}
                        min="1"
                        max="100"
                      /> */}
                      {/* <button className={styles.increment_button} onClick={() => incrementQuantity(item)}>+</button> */}
                    </div>
                    <p className={styles.item_price}><strong>{getFormattedCurrency(item?.price * (item?.qty ? item?.qty : 1))}</strong></p>
                    </div>
                    </div>



                ))}
                  <div className={styles.Order_CartOrderSummary_wrapper}>
                  <h3>Cart Order Summary</h3>
                <div className={styles.CartOrderSummary_wrapper}>

                  <div className={styles.CartOrderSummary_container}>
                    <div className={styles.CartOrderSummary_totalPriceContainer}>
                      <div>Subtotal ({cartItems.length} Item{cartItems.length > 1 ? 's' : ''})</div>
                      <span className={styles.CartOrderSummary_subTotalValue}>{getFormattedCurrency(cartSubTotal)}</span>
                    </div>
                    <div className={styles.CartOrderSummary_deliveryInfo}>
                      <div>Shipping</div>
                      <div className={styles.CartOrderSummary_deliveryAmount}>Delivery Charges if applicable</div>
                    </div>
                    <div className={styles.CartOrderSummary_deliveryInfo}>
                      <div>Estimated Delivery:</div>
                      {/* <div className={styles.CartOrderSummary_deliveryEstimate}>3 to 8 business days</div> */}
                      <div className={styles.CartOrderSummary_deliveryEstimate}>{deliveryRange}</div>
                    </div>
                    <div className={styles.CartOrderSummary_divider}></div>
                    <div className={styles.CartOrderSummary_totalPriceContainer}>
                      <div className={styles.CartOrderSummary_totalPrice}>Total</div>
                      <span className={styles.CartOrderSummary_totalValue}>{getFormattedCurrency(cartSubTotal)}</span>
                    </div>
                  </div>
                </div>

                </div>
              </div>
              <div className={styles.cart_bag_footer}>
                {/* <div className={styles.coupon_code}>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => handleCouponCode(e)}
                    placeholder="Enter Coupon Code"
                    className={styles.coupon_code_input}
                  />
                  <button className={styles.coupon_code_button}>Apply</button>
                </div> */}

{/* <div className="test123">

</div> */}

                <div className={styles.subtotal_section}>
                  <p>Subtotal</p>
                  <p>{getFormattedCurrency(cartSubTotal)}</p>
                </div>
                <div className={styles.button_section}>
                  {/* <p><span>Taxes and shipping calculated at checkout</span></p> */}
                  <button onClick={() => { window.location.href = process.env.baseURL + 'checkout/' }} className={styles.buy_now}>Proceed to Checkout</button>
                  {/* <p onClick={toggleCartBag}>Or</p> */}
                  {/* <Link href="/checkout/cart" className={styles.buy_now_link}>View Cart Details</Link> */}
                </div>
              </div>
            </>
          ) : (
            <div className={styles.cart_empty}>
              <div className={styles.cart_empty_inner}>
                <Image
                  src="/Images/emptyCart.png"
                  alt="Empty Cart"
                  width={150}
                  height={150}
                />
                <h3>Your Cart is Empty</h3>
                <p>Add some items to your cart to see them here.</p>
                <button onClick={handleShopRedirect} className={styles.shop_button}>Start Shopping</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } else {
    return (
      <div className={styles.cart_bag_outer}>
        <div ref={wrapperRef} className={styles.cart_bag}>
          <div className={styles.cart_bag_close}>
          <Image onClick={toggleCartBag} width={24} height={24} src="/Images/cross-23-32.png" alt="Close Cart" />
            <h3>My Cart</h3>

            <span className={styles.icon} onClick={toggleCartBag}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon-icon-_rq"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              {parseInt(cartCount) > 0 && (
                <span className={styles.cartCountNumber}>{cartCount}</span>
              )}
            </span>
          </div>
          <div className={styles.cart_bag_empty}>
            Loading...
          </div>
        </div>
      </div>
    );
  }
}

export default CartBag;