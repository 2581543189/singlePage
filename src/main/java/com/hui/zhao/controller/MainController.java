package com.hui.zhao.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * 公共常量类定义
 * <p>
 * <p>
 * 修改历史:											<br>
 * 修改日期    		修改人员   	版本	 		修改内容<br>
 * -------------------------------------------------<br>
 * 2018/4/28   hui.zhao     1.0    	初始化创建<br>
 * </p>
 *
 * @author hui.zhao
 * @version 1.0
 * @since JDK1.7
 */
@Controller
public class MainController {

    /**
     * 获取用户信息.
     *
     * @return
     */
    @RequestMapping(value = "website/index")
    public void index(HttpServletResponse response) {
        try {
            response.getWriter().println(
                    "<script language=\"javascript\">if(window.opener==null){window.top.location.href=\"" + "../root.html#index"
                            + "\";}else{window.opener.top.location.href=\"" + "../root.html#index" + "\";window.close();}</script>");
        } catch (IOException e) {
        }
    }
}
