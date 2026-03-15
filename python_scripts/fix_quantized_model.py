import onnx
import numpy as np
import os

# 修复模型中的类型不匹配问题
def fix_model_type_mismatch(model_path, output_path):
    print(f"修复模型: {model_path}")
    
    # 加载模型
    model = onnx.load(model_path)
    
    # 创建新的节点列表
    new_nodes = []
    
    # 遍历所有节点，查找类型不匹配的Add节点
    for node in model.graph.node:
        if node.op_type == 'Add':
            # 检查输入类型
            input1_name = node.input[0]
            input2_name = node.input[1]
            
            # 查找输入的类型
            input1_type = None
            input2_type = None
            
            # 检查输入是否为初始值
            for initializer in model.graph.initializer:
                if initializer.name == input1_name:
                    input1_type = initializer.data_type
                if initializer.name == input2_name:
                    input2_type = initializer.data_type
            
            # 检查输入是否为图的输入
            for input in model.graph.input:
                if input.name == input1_name:
                    input1_type = input.type.tensor_type.elem_type
                if input.name == input2_name:
                    input2_type = input.type.tensor_type.elem_type
            
            # 如果类型不匹配，添加类型转换节点
            if input1_type is not None and input2_type is not None and input1_type != input2_type:
                print(f"修复Add节点类型不匹配: {input1_name} ({input1_type}) 和 {input2_name} ({input2_type})")
                
                # 创建类型转换节点
                cast_node = onnx.helper.make_node(
                    'Cast',
                    inputs=[input2_name],
                    outputs=[f"{input2_name}_cast"],
                    to=input1_type
                )
                
                # 添加转换节点
                new_nodes.append(cast_node)
                
                # 更新Add节点的输入
                new_node = onnx.helper.make_node(
                    'Add',
                    inputs=[input1_name, f"{input2_name}_cast"],
                    outputs=node.output
                )
                new_nodes.append(new_node)
            else:
                # 保持原节点不变
                new_nodes.append(node)
        else:
            # 保持原节点不变
            new_nodes.append(node)
    
    # 替换模型中的节点列表
    del model.graph.node[:]
    model.graph.node.extend(new_nodes)
    
    # 保存修复后的模型
    onnx.save(model, output_path)
    print(f"修复后的模型保存到: {output_path}")

# 修复编码器和解码器模型
model_dir = "/home/kecai/vue-tts/public/models/SenseVoiceSmall-onnx/onnx/quantized"
encoder_path = os.path.join(model_dir, "encoder_model_q4.onnx")
decoder_path = os.path.join(model_dir, "decoder_model_merged_q4.onnx")

fixed_encoder_path = os.path.join(model_dir, "encoder_model_q4_fixed.onnx")
fixed_decoder_path = os.path.join(model_dir, "decoder_model_merged_q4_fixed.onnx")

# 修复编码器模型
fix_model_type_mismatch(encoder_path, fixed_encoder_path)

# 修复解码器模型
fix_model_type_mismatch(decoder_path, fixed_decoder_path)

print("\n模型修复完成！")