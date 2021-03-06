import { Component, OnInit,Input,Output,EventEmitter } from '@angular/core';
import * as g from'./../../type';
@Component({
  selector: 'app-shopping-card-page',
  templateUrl: './shopping-card-page.component.html',
  styleUrls: ['./shopping-card-page.component.css']
})
export class ShoppingCardPageComponent implements OnInit {
  @Input() id:any='';
  @Output() close=new EventEmitter()
  $thr:any=$('table thead tr');
  $tbr:any=$('table tbody tr');
  dataList:any;
  tbShow:boolean=false;
  totalPrice:any;
  isSearchLoading:boolean=false;
  sellerInfo:any={};
  constructor() { }

  ngOnInit() {

  }
  ngOnChanges(){
    $("#shopCar").fadeIn(g.time);
    if(this.id==''){
      setTimeout(json=>{
        alert("请先登录");
        this.close.emit();
      },100)

    }
    else{
      this.getShopCarData()
    }
  }


  //全选点击操作
  checkAllFun(){
    if($("#checkAll").prop("checked")){
      this.$tbr=$('table tbody tr');
      this.$tbr.find('input').prop('checked',true);
      return;
    }
    this.$tbr=$('table tbody tr');
    this.$tbr.find('input').prop('checked',false);
  }
  //当选中其中之一
  checkItemFun(){
   $("#checkAll").prop('checked',this.$tbr.find('input:checked').length == this.$tbr.length ? true : false);
  }
  //获取购物车列表
  getShopCarData(){
    this.tbShow=false;
    let url="http://localhost:8080/gpsys/shopcar/getShopcarInfo"
    let send={
      userId:this.id
    }
    $.ajax(url,{
      data:send,
      dataType:"jsonp",
      jsonp:"callback",
      success:json=>{
       if(json.stage==1){
         this.dataList=[];
         var dataObj=json.data
         for(let item in dataObj){
           if(parseInt(dataObj[item].commodityData.commodityNumber)>parseInt(dataObj[item].commodityNumber)){
             dataObj[item]['hasNumber']='true';
           }else{
             dataObj[item]['hasNumber']='false';
           }
           dataObj[item]['totalPrice']=parseInt(dataObj[item].commodityNumber)*parseInt(dataObj[item].commodityData.commodityPrice)
           dataObj[item]['picData']=[]
           let url=g.namespace+"/gpsys/commodity/getCommodityPicById";
           let send={
             picId:dataObj[item].commodityData.commodityId
           }
           $.ajax(url,{
             data:send,
             dataType:'jsonp',
             success:json=>{
               if(json.stage==1){
                 for(let item1 of json.data){

                   if(item1.picType=='2'){
                     dataObj[item]['picData'].push(item1.picBase64);
                     break;
                   }
                 }
                 this.dataList.push(dataObj[item]);
               }
             }
           })
         }
         setTimeout(json=>{
           this.setTotalPrice();
         },1000)
         this.tbShow=true;
         console.log(this.dataList)
       }
       else{
         alert("服务器错误："+json.msg)
       }
      }
    })
  }
  //购物车点击减少
  reduceNumber(commodityId,commodityNumber,commodityAllNumber,index){
    if(commodityNumber!=1){
      let url=g.namespace+"/gpsys/shopcar/changeShoppingCarVolumeNumById";
      let send={
        commodityId:commodityId,
        changeNum:(parseInt(commodityNumber)-1).toString(),
        userId:this.id
      }
      $.ajax(url,{
        data:send,
        dataType:"jsonp",
        json:"callback",
        success:json=>{
          if(json.stage==1){
            if(parseInt(commodityAllNumber)>parseInt(commodityNumber)-1){
              this.dataList[index]['hasNumber']='true';
            }else{
              this.dataList[index]['hasNumber']='false';
            }
            this.dataList[index]['commodityNumber']=(parseInt(commodityNumber)-1).toString();
            this.dataList[index]['totalPrice']=parseInt(this.dataList[index].commodityNumber)*parseInt(this.dataList[index].commodityData.commodityPrice)
           console.log(this.dataList)
            this.setTotalPrice();
          }
          else{
            alert("修改失败："+json.msg)
          }
        }
      })
    }
    else{
      alert("已为最小值");
      return;

    }
  }
  //购物车点击减少
  AddNumber(commodityId,commodityNumber,commodityAllNumber,index){
      let url=g.namespace+"/gpsys/shopcar/changeShoppingCarVolumeNumById";
      let send={
        commodityId:commodityId,
        changeNum:(parseInt(commodityNumber)+1).toString(),
        userId:this.id
      }
      $.ajax(url,{
        data:send,
        dataType:"jsonp",
        json:"callback",
        success:json=>{
          if(json.stage==1){
            if(parseInt(commodityAllNumber)>parseInt(commodityNumber)+1){
              this.dataList[index]['hasNumber']='true';
            }else{
              this.dataList[index]['hasNumber']='false';
            }
            this.dataList[index]['commodityNumber']=(parseInt(commodityNumber)+1).toString();
            this.dataList[index]['totalPrice']=parseInt(this.dataList[index].commodityNumber)*(parseInt(this.dataList[index].commodityData.commodityPrice))
            this.setTotalPrice();
          }
          else{
            alert("修改失败："+json.msg)
          }
        }
      })
    }
  //删除购物车商品
  delete(commodityId){
    if(confirm("确定要删除吗？")){
      let url=g.namespace+"/gpsys/shopcar/delShopcarInfo"
      let send={
        commodityIds:commodityId,
        userId:this.id
      }
      $.ajax(url,{
        data:send,
        dataType:"jsonp",
        jsonp:"callback",
        success:json=>{
          if(json.stage==1){
            alert("删除成功");
            this.getShopCarData();
          }
          else{
            alert("删除失败:"+json.msg);
          }
        }
      })
    }
    else{
      return;
    }

  }

  //计算所有商品总价格
  setTotalPrice(){
    this.totalPrice=0;
    for(let item of this.dataList){
      this.totalPrice=this.totalPrice+item.totalPrice;
    }
    console.log( this.totalPrice)
  }
  //结算
  goToPay(){
    for(let item of this.dataList){
      if(item.hasNumber=='false'){
        alert("购物车中存在数量大于商品总数的商品，请进行修改");
        return;
      }
    }
    setTimeout(json=>{
      let url=g.namespace+"/gpsys/order/getPaySession";
      $.ajax(url,{
        data:{stage:"-1"},
        dataType:'jsonp',
        success:json=>{
        }
      })
    },900000)
    this.isSearchLoading=true;
    window.open(g.namespace+"/gpsys/order/alipayToOrder?money="+this.totalPrice);
    var get=setInterval(json=>{
      let url=g.namespace+"/gpsys/order/getPaySession";
      $.ajax(url,{
        data:{stage:"0"},
        dataType:'jsonp',
        success:json=>{
          if(json.stage==1){
            console.log(json.data.paySessionId)
            if(json.data.paySessionId=='1'){
              clearInterval(get)
              this.orderCreateFun("1")
            }else if (json.data.paySessionId=='-1'){
              clearInterval(get)
              this.orderCreateFun("-1")
            }
            else{
              // console.log("**")
            }
          }
        }
      })
    },2000)
  }

  orderCreateFun(stage){
    var length=this.dataList.length
    var index=0
    for(let item of this.dataList){
      this.sellerInfo={};
      let url=g.namespace+"/gpsys/seller/getSellerInfoByVolumeId";
      let send={
        volumeId:item.commodityData.volumeId
      }
      console.log(send)
      $.ajax(url,{
        data:send,
        dataType:'jsonp',
        success:json=>{
          if(json.stage==1){
            this.sellerInfo=json.data;
            let url=g.namespace+"/gpsys/order/userPayToSeller";
            let send={
              id:this.id,
              sellerId:this.sellerInfo.sellerId,
              money:item.totalPrice
            }
            $.ajax(url,{
              data:send,
              dataType:'jsonp',
              success:json=>{
                if(json.stage==1){
                  let url=g.namespace+"/gpsys/order/changeOrderAndShopcar";
                  let send={
                    ids:item.shopCarData.id,
                    state:stage
                  }
                  $.ajax(url,{
                    data:send,
                    dataType:'jsonp',
                    success:json=>{
                      if(json.stage==1){
                        index++
                        if(index==length){
                          alert("支付成功")
                          this.isSearchLoading=false;
                          this.getShopCarData();
                        }
                      }
                    }
                  })
                }
                else{
                  alert(json.msg)
                }
              }
            })
          }
        }
      })

    }


  }
}
